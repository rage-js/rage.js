/**
 * Get current time to log on console
 * @returns {string | false}
 */
function getCurrentTime(): string | false {
  try {
    const now = new Date();

    // Get hours (0-23)
    let hours: any = now.getHours();

    // Get minutes (0-59)
    let minutes: any = now.getMinutes();

    // Get seconds (0-59)
    let seconds: any = now.getSeconds();

    // Format the time string with leading zeros (optional)
    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  } catch (error: any) {
    console.error(error); // Throw error, do not just console log

    return false;
  }
}

export default getCurrentTime;
