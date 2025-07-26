const bcrypt = require('bcrypt');
const readlineSync = require('readline-sync');

async function comparePasswords() {
  try {
    const plainPassword = readlineSync.question('Enter password to check: ', {
      hideEchoBack: true,
    });

    const hashedPassword = readlineSync.question('\nEnter stored hash: ');

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

    if (isMatch) {
      console.log('\n✅ Password matches the hash!');
    } else {
      console.log('\n❌ Password does NOT match the hash.');
    }
  } catch (err) {
    console.error('❌ Error during comparison:', err.message);
  }
}

comparePasswords();
