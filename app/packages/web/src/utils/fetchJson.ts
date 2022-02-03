export const fetchJson = async (...args: any) => {
  try {
    const response = await fetch(args);
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    const error: any = new Error(response.statusText);
    error.response = response;
    error.data = data;
    throw error;
  } catch (error: any) {
    if (!error.data) {
      error.data = {
        message: error.message,
      };
    }
    throw error;
  }
};
