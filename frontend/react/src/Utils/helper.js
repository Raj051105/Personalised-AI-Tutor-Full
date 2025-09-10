export const validEmail = (email) => {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
}

export const getInitials = (name) => {
  return name
    .split(" ")               // Split by spaces
    .slice(0, 2)              // Take at most 2 words
    .map(word => word[0])     // Take first letter of each word
    .join("")                 // Join them together
    .toUpperCase();           // Make it uppercase
}

export const formatTitle = (name) => {
  let result = name.replace(/_/g, " ");
  // Capitalize the first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}