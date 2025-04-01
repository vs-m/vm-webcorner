const fs = require("fs").promises;
const path = require("path");

const SECRET_KEY = "chicnstu";
const DATA_FILE = path.join(__dirname, "updates.json"); 


exports.handler = async (event) => {
    if (event.httpMethod === "GET") {
        try {
            const data = await fs.readFile(DATA_FILE, "utf8");
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: data || "[]"
            };
        } catch (error) {
            return { statusCode: 500, body: JSON.stringify({ error: "erro no load" }) };
        }
    } 
    
    else if (event.httpMethod === "POST") {
        try {
            const { title, content, key } = JSON.parse(event.body);
            
            if (key !== SECRET_KEY) {
                return { statusCode: 403, body: JSON.stringify({ error: "acesso negado" }) };
            }

            const data = await fs.readFile(DATA_FILE, "utf8");
            let updates = JSON.parse(data || "[]");

            updates.unshift({ title, content, date: new Date().toISOString() });

            await fs.writeFile(DATA_FILE, JSON.stringify(updates, null, 2));

            return { statusCode: 201, body: JSON.stringify({ message: "update salv" }) };

        } catch (error) {
            return { statusCode: 500, body: JSON.stringify({ error: "erro ao salvar" }) };
        }
    }

    return { statusCode: 405, body: JSON.stringify({ error: "método não permitido" }) };
};
