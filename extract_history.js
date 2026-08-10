const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\80e2e6aa-675a-4701-93b0-104a4f8c5ba1\\.system_generated\\logs\\transcript_full.jsonl';

async function extractFiles() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let pageTsxContent = null;
  let schemaSqlContent = null;
  
  // We want to find the last time we wrote these files *before* the lazy loading prompt.
  // So we'll collect all writes and pick the right one.
  const writes = {
    'page.tsx': [],
    'schema.sql': []
  };

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
          if (call.name === 'default_api:write_to_file' || call.name === 'write_to_file') {
            const args = call.arguments || call.args || {};
            const target = args.TargetFile || '';
            const content = args.CodeContent || '';
            
            if (target.endsWith('app\\page.tsx') || target.endsWith('app/page.tsx')) {
              writes['page.tsx'].push(content);
            }
            if (target.endsWith('docs\\schema.sql') || target.endsWith('docs/schema.sql')) {
              writes['schema.sql'].push(content);
            }
          }
        }
      }
    } catch(e) {}
  }
  
  console.log(`Found ${writes['page.tsx'].length} versions of page.tsx`);
  console.log(`Found ${writes['schema.sql'].length} versions of schema.sql`);
  
  // We want the 2nd to last one if the last one was the one to revert, or we can just save all of them so we can manually check.
  writes['page.tsx'].forEach((c, i) => fs.writeFileSync(`page_tsx_v${i}.txt`, c));
  writes['schema.sql'].forEach((c, i) => fs.writeFileSync(`schema_sql_v${i}.txt`, c));
  console.log('Saved to txt files');
}

extractFiles();
