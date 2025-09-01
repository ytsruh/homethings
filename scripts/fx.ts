interface CurrencyData {
  id?: string;
  date: string;
  base_currency: string;
  USD: number;
  EUR: number;
  JPY: number;
  GBP: number;
  CAD: number;
  CHF: number;
  CNY: number;
  INR: number;
  AUD: number;
  NZD: number;
}

async function sendData() {
  const file = Bun.file("data/fx_data.json");
  const data = (await file.json()) as CurrencyData[];
  const endpoint =
    "https://homethings-api.ytsruh.com/api/collections/fx_rates/records"; // Replace with actual endpoint
  const delayMs = 100;

  console.log(`Sending...`);
  for (let i = 0; i < data.length; i++) {
    try {
      //remove id property
      delete data[i]!.id;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data[i]),
      });
      if (!response.ok) {
        const res = await response.json();
        console.log(res);
        console.error(`ERROR: Request ${i + 1} failed: ${response.status}`);
      } else {
        console.log(`#${i + 1} sent`);
      }
    } catch (error) {
      console.error(`ERROR: Error sending request ${i + 1}:`, error);
    }
    // Add delay before next request
    if (i < data.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

sendData();
