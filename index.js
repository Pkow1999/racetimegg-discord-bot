const Discord = require('discord.js');
const config = require('./config/config.json');
const jsonfile = require('jsonfile');
const getJSON = require('get-json');
let announced_races = jsonfile.readFileSync("./announced_races.json");
const client = new Discord.Client();
jsonfile.spaces = 4;

client.once('ready', () => {
	console.log('Ready!');
});

client.login(config.token);

client.on('message', message => {
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content.slice(config.prefix.length).split(' ');
	const command = args.shift().toLowerCase();
	if (command === 'racelist') {
		getJSON('https://racetime.gg/races/data', function(error, response) {
			if (error) {
				return console.log(error);
			}
			const stringified = (JSON.stringify(response));
			const parsed = (JSON.parse(stringified));

			parsed.races.forEach(element => {
				if (JSON.stringify(element.name).includes('gta')) {
					message.channel.send('Game: ' + element.category.name + ' - Category: ' + element.goal.name + ' - Players: ' + element.entrants_count + ' (https://racetime.gg' + element.url + ')');
				}
			});
		});
	}
});

function NewRaceCheck() {
	getJSON('https://racetime.gg/races/data', function(error, response) {
		if (error) {
			return console.log(error);
		}
		const stringified = (JSON.stringify(response));
		const parsed = (JSON.parse(stringified));
		console.log('checking races');
		console.log('announced races: ' + announced_races);
		const test_bot_channel = client.channels.cache.get('703050360498946458');
		const gta_race_channel = client.channels.cache.get('298906757416353792');
		parsed.races.forEach(element => {
			const race_name = (JSON.stringify(element.name));
			if (race_name.includes('gta') && !announced_races.includes(race_name)) {
				announced_races.push(race_name);
				test_bot_channel.send('A new race is happening! Game: ' + element.category.name + ' - Category: ' + element.goal.name + ' - Link: https://racetime.gg' + element.url);
				gta_race_channel.send('A new race is happening! Game: ' + element.category.name + ' - Category: ' + element.goal.name + ' - Link: https://racetime.gg' + element.url);
			}
		});
	});
}

setInterval(NewRaceCheck, 5000);

function WriteRacesToFile() {
	console.log('writing json for backup');
	jsonfile.writeFile("./announced_races.json", announced_races);
}

setInterval(WriteRacesToFile, 60000);