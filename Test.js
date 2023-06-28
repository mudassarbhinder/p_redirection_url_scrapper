const axios = require("axios");

(async () => {
  for (let i = 0; i < 10; i++) {
    let resp = await axios.get(
      "http://localhost:3000/api/wix/?pid=218716307&psid=BM3UzuhbpvAZmXMHLdcp0"
    );
    console.log(i, await resp.data);
  }
})();
