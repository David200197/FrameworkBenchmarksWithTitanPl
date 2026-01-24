import t from "../titan/titan.js";

t.post("/json").action("json")

t.get("/plaintext").reply("Hello, World!");

t.start(3000, "Titan Running!");
