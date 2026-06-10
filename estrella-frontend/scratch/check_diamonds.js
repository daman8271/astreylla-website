const username = "LGD-LGD-AUGMONT ENTERPRISES PRIVATE LIMITED";
const password = "LGD-LGD-588833";
const baseUrl = "https://diamonds-api.augmont.com/api/v1";

async function run() {
  try {
    const loginRes = await fetch(`${baseUrl}/merchant/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token;

    // Search for some overtone options
    const qs = new URLSearchParams({
      fancyColorOvertone: "Yellowish,Pinkish,Blueish,Reddish,Greenish",
      from: "1",
      to: "250",
    }).toString();

    const prodRes = await fetch(`${baseUrl}/merchant/products?${qs}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const prodData = await prodRes.json();
    const list = prodData.data?.products ?? prodData.data ?? prodData.products ?? [];

    const mappings = new Map();
    for (const p of list) {
      const key = p.color;
      mappings.set(key, {
        fancyColor: p.fancyColor,
        intensity: p.fancyColorIntensity,
        overtone: p.fancyColorOvertone,
      });
    }

    console.log("Overtone Mappings count:", mappings.size);
    for (const [code, info] of mappings.entries()) {
      console.log(`${code} => Color: ${info.fancyColor}, Intensity: ${info.intensity}, Overtone: ${info.overtone}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
