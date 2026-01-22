import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';

// Note: You need to set GEMINI_API_KEY in your environment
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const BATCH_SIZE = 50;
const TOTAL_ITEMS = 500;
const OUTPUT_FILE = path.join(__dirname, '../backend/massive_data.sql');

async function generate() {
    if (!API_KEY) {
        console.error("Please set GEMINI_API_KEY environment variable.");
        return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    let allSql = "-- Massive Enriched Food Data\n";
    let generatedCount = 0;
    let existingItems: string[] = [];

    console.log(`Starting generation of ${TOTAL_ITEMS} items...`);

    for (let i = 0; i < TOTAL_ITEMS / BATCH_SIZE; i++) {
        console.log(`Generating batch ${i + 1}/${TOTAL_ITEMS / BATCH_SIZE}...`);

        const prompt = `
            You are a food data specialist. Generate ${BATCH_SIZE} unique food items for a food suggestion app.
            Each item must be returned as a SQL INSERT statement for a table named 'foods' with these columns:
            id (unique string, lowercase), name_tr, name_en, cuisine, moods (JSON array of strings), regions (JSON array of strings), is_vegetarian (0 or 1), is_vegan (0 or 1), is_gluten_free (0 or 1), description_tr, description_en.

            Avoid these already generated items: [${existingItems.join(', ')}].

            Focus on:
            - Global diversity (Nordic, African, South-East Asian, Caribbean, etc.).
            - Deep Turkish regional cuisine (beyond the common ones).
            - Specific sub-categories (Breakfast, Street Food, Fine Dining, Snacks).

            Return ONLY the raw SQL INSERT statements. No markdown block.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const sql = text.replace(/```sql|```/g, "").trim();

        allSql += sql + "\n";

        // Extract IDs to prevent duplicates in next prompt (simple regex)
        const idMatches = sql.match(/INSERT INTO foods \(id/gi);
        if (idMatches) {
            const ids = sql.match(/\('[^']+'/g)?.map(m => m.replace("('", "").replace("'", "")) || [];
            existingItems.push(...ids);
            generatedCount += ids.length;
        }

        console.log(`Batch ${i + 1} done. Total items so far: ${existingItems.length}`);
    }

    fs.writeFileSync(OUTPUT_FILE, allSql);
    console.log(`Successfully generated and saved ${existingItems.length} items to ${OUTPUT_FILE}`);
}

generate();
