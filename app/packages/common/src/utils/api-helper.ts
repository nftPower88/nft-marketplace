export async function fetchGetJSON(url: string) {
  try {
    const data = await fetch(url).then(res => res.json());
    return data;
  } catch (err: any) {
    throw new Error(err.message);
  }
}
