/**
 * Sleep function which will make the process wait for few seconds
 * @param ms {number}
 * @returns {Promise<any>}
 */
export default async function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
