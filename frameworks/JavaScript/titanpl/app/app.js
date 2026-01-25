import t from "../titan/titan.js";

t.post("/json").action("json")

t.get("/plaintext").action("plaintext")

t.start(3000, "Titan Running!");
