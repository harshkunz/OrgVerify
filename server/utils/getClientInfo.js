// utils/getClientInfo.js
export const getClientIPInfo = async () => {
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();
  
      const locationRes = await fetch(`https://ipwho.is/${ip}`);
      const data = await locationRes.json();
  
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        isp: data.connection?.isp,
      };
    } catch (err) {
      console.error("Failed to fetch client IP/location", err);
      return null;
    }
  };
  