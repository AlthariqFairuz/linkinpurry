
export const isLoggedIn = async () => {
  const response = await fetch(`http://localhost:3000/api/verify`, {
    credentials: 'include'
  });

  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  return data.success;
};
