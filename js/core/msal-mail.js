let msalInstance = null;

function initMSAL() {
  if (!APP_CONFIG.msalClientId || APP_CONFIG.msalClientId.includes("DEINE_MICROSOFT")) {
    console.warn("MSAL Client-ID noch nicht in config.js gesetzt.");
    return;
  }

  const msalConfig = {
    auth: {
      clientId: APP_CONFIG.msalClientId,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: window.location.origin
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false
    }
  };

  msalInstance = new msal.PublicClientApplication(msalConfig);
}

async function sendDirectOutlookMail() {
  if (typeof completedUnits === 'undefined' || completedUnits.length === 0) {
    alert("Bitte zuerst mindestens eine Einheit erfassen!");
    return;
  }

  if (!msalInstance) {
    initMSAL();
    if (!msalInstance) {
      alert("Microsoft Client-ID fehlt. Bitte in js/config.js konfigurieren.");
      return;
    }
  }

  try {
    let account = msalInstance.getAllAccounts()[0];
    if (!account) {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["User.Read", "Mail.Send"]
      });
      account = loginResponse.account;
    }

    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: ["Mail.Send"],
      account: account
    }).catch(async () => {
      return await msalInstance.acquireTokenPopup({ scopes: ["Mail.Send"] });
    });

    const project = document.getElementById('inProject').value;
    const location = document.getElementById('inLocation').value;
    const dateStr = document.getElementById('lblDate').textContent;

    const { blob, filename } = generateVectorPDF(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async function() {
      const base64Data = reader.result.split(',')[1];

      const mailPayload = {
        message: {
          subject: `Spleißprotokoll: ${project} - ${location}`,
          body: {
            contentType: "Text",
            content: `Hallo Technik-Team,\n\nanbei das Spleißprotokoll für ${project} (${location}).\n\nFirma: ${APP_CONFIG.companyName}\nDatum: ${dateStr}\nErfasste Einheiten: ${completedUnits.length}`
          },
          toRecipients: APP_CONFIG.recipients.map(addr => ({ emailAddress: { address: addr } })),
          attachments: [
            {
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: filename,
              contentType: "application/pdf",
              contentBytes: base64Data
            }
          ]
        }
      };

      const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenResponse.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mailPayload)
      });

      if (response.ok) {
        alert("✅ Spleißprotokoll wurde erfolgreich direkt über euer Firmen-Outlook versendet!");
      } else {
        const errorData = await response.json();
        console.error("Graph Error:", errorData);
        alert("Fehler beim Versenden der E-Mail über Outlook.");
      }
    };

  } catch (err) {
    console.error("Anmelde-/Sendefehler:", err);
    alert("Anmeldung fehlgeschlagen oder abgebrochen.");
  }
}
