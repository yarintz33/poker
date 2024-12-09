function Str_Random(length) {
  let result = "";
  const characters = "0123456789";

  // Loop to generate characters for the specified length
  for (let i = 0; i < length; i++) {
    const randomInd = Math.floor(Math.random() * 10);
    result += characters.charAt(randomInd);
  }
  return result;
}

export default Str_Random;
