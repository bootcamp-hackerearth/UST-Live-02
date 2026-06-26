const crypto = require("node:crypto");

const generateTemporaryPassword = () => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "@#$!";

  const allCharacters =
    uppercase + lowercase + numbers + symbols;

  const randomCharacter = (characters) => {
    return characters[
      crypto.randomInt(0, characters.length)
    ];
  };

  const passwordCharacters = [
    randomCharacter(uppercase),
    randomCharacter(lowercase),
    randomCharacter(numbers),
    randomCharacter(symbols),
  ];

  while (passwordCharacters.length < 10) {
    passwordCharacters.push(
      randomCharacter(allCharacters)
    );
  }

  // Securely shuffle the characters
  for (
    let index = passwordCharacters.length - 1;
    index > 0;
    index--
  ) {
    const randomIndex = crypto.randomInt(
      0,
      index + 1
    );

    [
      passwordCharacters[index],
      passwordCharacters[randomIndex],
    ] = [
      passwordCharacters[randomIndex],
      passwordCharacters[index],
    ];
  }

  return passwordCharacters.join("");
};

module.exports = generateTemporaryPassword;