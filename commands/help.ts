import * as fs from "fs";
import * as path from "path";
import AuroraBetaStyler from "@aurora/styler";
const { LINE } = AuroraBetaStyler;

const helpCommand: ShadowBot.Command = {
  config: {
    name: "help",
    description: "Displays all available commands or detailed info about a specific command",
    usage: "/help or /help <command> or /help <page> or /help all",
    aliases: [],
    category: "Utility"
  },
  run: async ({ api, event, prefix, args }) => {
    const { threadID, messageID } = event;
    const commandsDir = path.join(__dirname, "..", "commands");

    if (!fs.existsSync(commandsDir)) {
      await new Promise(resolve => {
        api.sendMessage(
          AuroraBetaStyler.styleOutput({
            headerText: "Error",
            headerSymbol: "❌",
            headerStyle: "bold",
            bodyText: "Commands directory not found.",
            bodyStyle: "sansSerif",
            footerText: "Developed by: **Aljur Pogoy**"
          }),
          threadID,
          (err: any, info: any) => {
            resolve(info);
          },
          messageID
        );
      });
      return;
    }

    let commandList: string[] = [];
    let eventList: string[] = [];

    try {
      const commandFiles = getAllCommandFiles(commandsDir); // Updated to use recursive function
      commandFiles.forEach(file => {
        const commandPath = file;
        try {
          delete require.cache[require.resolve(commandPath)];
          const commandModule = require(commandPath);
          const command = commandModule.default || commandModule;
          const commandName = path.basename(file).replace(/\.js|\.ts/, "");
          if (typeof command !== "object" || (!command.config?.name && !command.name)) {
            return;
          }
          const name = command.config?.name || command.name;
          if (command.handleEvent) {
            eventList.push(` ${name}`);
          } else if (command.run || command.execute) {
            commandList.push(`${name} (${file.endsWith(".ts") ? "TS" : "JS"})`);
          }
        } catch (cmdError) {
          // Skip invalid command files silently
        }
      });
    } catch (error) {
      await new Promise(resolve => {
        api.sendMessage(
          AuroraBetaStyler.styleOutput({
            headerText: "Error",
            headerSymbol: "❌",
            headerStyle: "bold",
            bodyText: "Error loading command list.",
            bodyStyle: "sansSerif",
            footerText: "Developed by: **Aljur Pogoy**"
          }),
          threadID,
          (err: any, info: any) => {
            resolve(info);
          },
          messageID
        );
      });
      return;
    }

    const styledMessage = (header: string, body: string, symbol: string) =>
      AuroraBetaStyler.styleOutput({
        headerText: header,
        headerSymbol: symbol,
        headerStyle: "bold",
        bodyText: body,
        bodyStyle: "sansSerif",
        footerText: "Developed by: **Aljur Pogoy**"
      });

    let sentMessageID: string;

    if (args.length > 0 && args[0].toLowerCase() === "all") {
      const allCommands = [...commandList, ...eventList].join("\n");
      await new Promise(resolve => {
        api.sendMessage(
          styledMessage("All Commands", allCommands || "No commands available.", "🌐"),
          threadID,
          (err: any, info: any) => {
            sentMessageID = info?.messageID;
            resolve(info);
          },
          messageID
        );
      });
      return;
    }

    if (args.length > 0 && isNaN(parseInt(args[0]))) {
      const commandName = args[0].toLowerCase();
      const commandPath = path.join(commandsDir, `${commandName}.js`) || path.join(commandsDir, `${commandName}.ts`);
      if (!fs.existsSync(commandPath)) {
        await new Promise(resolve => {
          api.sendMessage(
            styledMessage("Error", `❌ Command "${commandName}" not found.`, "⚠️"),
            threadID,
            (err: any, info: any) => {
              sentMessageID = info?.messageID;
              resolve(info);
            },
            messageID
          );
        });
        return;
      }

      try {
        delete require.cache[require.resolve(commandPath)];
        const commandModule = require(commandPath);
        const command = commandModule.default || commandModule;
        if (typeof command !== "object" || (!command.config?.name && !command.name)) {
          await new Promise(resolve => {
            api.sendMessage(
              styledMessage("Error", `❌ Invalid command: ${commandName}`, "⚠️"),
              threadID,
              (err: any, info: any) => {
                sentMessageID = info?.messageID;
                resolve(info);
              },
              messageID
            );
          });
          return;
        }

        const name = command.config?.name || command.name;
        const bodyText = `
Name: ${name || "N/A"}
Category: ${command.config?.category || "N/A"}
Description: ${command.config?.description || command.description || "No description available"}
Author: ${command.config?.author || command.author || "Cid Kagenou"}
Version: ${command.config?.version || command.version || "1.0"}
Usage: ${command.config?.usage || command.usage || `/${name}`}
        `.trim();
        await new Promise(resolve => {
          api.sendMessage(
            styledMessage("Command Info", bodyText, "ℹ️"),
            threadID,
            (err: any, info: any) => {
              sentMessageID = info?.messageID;
              resolve(info);
            },
            messageID
          );
        });
        return;
      } catch (error) {
        await new Promise(resolve => {
          api.sendMessage(
            styledMessage("Error", `❌ Error loading command: ${commandName}`, "⚠️"),
            threadID,
            (err: any, info: any) => {
              sentMessageID = info?.messageID;
              resolve(info);
            },
            messageID
          );
        });
        return;
      }
    }

    const commandsPerPage = 10;
    const totalPages = Math.ceil(commandList.length / commandsPerPage);
    const page = args.length > 0 && !isNaN(parseInt(args[0])) ? parseInt(args[0]) : 1;

    if (page < 1 || page > totalPages) {
      await new Promise(resolve => {
        api.sendMessage(
          styledMessage("Error", `❌ Invalid page. Choose between 1 and ${totalPages}.`, "⚠️"),
          threadID,
          (err: any, info: any) => {
            sentMessageID = info?.messageID;
            resolve(info);
          },
          messageID
        );
      });
      return;
    }

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = Math.min(startIndex + commandsPerPage, commandList.length);
    const paginatedCommands = commandList.slice(startIndex, endIndex);

    const bodyText = `
📌 Commands:
${paginatedCommands.length > 0 ? paginatedCommands.join("\n") : "No commands on this page."}
${LINE}
🌟 Event Commands:
${page === 1 && eventList.length > 0 ? eventList.join("\n") : ""}
${LINE}
📖 Page ${page}/${totalPages}
${totalPages > 1 ? "> 🔄 Next page: /help " + (page + 1) + "\n" : ""}
 ℹ️ Details: ${prefix}help <command>
 🌟 All Commands: ${prefix}help all
 🌟 Enjoy Cid Kagenou Bot!
    `.trim();

    await new Promise(resolve => {
      api.sendMessage(
        styledMessage("Help", bodyText, "🌐"),
        threadID,
        (err: any, info: any) => {
          sentMessageID = info?.messageID;
          resolve(info);
        },
        messageID
      );
    });
  }
};

// Recursive function to get all command files
function getAllCommandFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllCommandFiles(filePath)); // Recursively get files
    } else if (file.endsWith(".js") || file.endsWith(".ts")) {
      results.push(filePath);
    }
  });
  return results;
}

export default helpCommand;