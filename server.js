let express = require("express");
let app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res)=>{
    res.render("index")
})

// Start listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Crash is running on port ${ PORT }`);
});