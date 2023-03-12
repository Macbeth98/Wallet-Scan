export async function getDateTime (): Promise<{date: string, timestamp: number}> {
  return new Promise(async (resolve)=>{
    const dateObj = new Date();
    const date = dateObj.toLocaleString("en-US", { timeZone: "America/New_York" });
    const timestamp = Date.now();
  
    return resolve({ date, timestamp });
  })
}