'use strict';
const express = require('express');
const moment = require('moment');
const fs = require('fs');
const os = require('os');

const port = 9673;
const dir = 'logs';
const app = express();


if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

app.use(express.json());

app.use((req, res, next) => {
	res.append('Access-Control-Allow-Origin', '*');
	res.append('Access-Control-Allow-Headers', '*');

	next();
});

app.post('/event', (req, res) => {
	const date = moment().format('DD-MM-YYYY');
	const data = format(req.body);
	fs.appendFile(`${dir}/${date}.log`, data + os.EOL, (err) => {
		if (err) throw err;
	});

	res.sendStatus(200);
});

function format(event) {
	const ed = event.data.eventData;
	const data = [moment().format('HH:mm'),
		event.data.actor.id, event.data.actor.name];

	const specificFields = [];
	switch(event.code) {
		case 'chat':
		case 'serverBroadcast':
			specificFields.push('message');
			break;
		case 'tryMessage':
			data.push(ed.success ? 'успешно' : 'безуспешно');
			specificFields.push('message');
			break;
		case 'userRoll':
			specificFields.push('num');
			break;
		case 'diceResult':
			ed.rolls.forEach(roll => {
				data.push(`${roll.num}/${roll.sides}`);
			});
			break;
		case 'youtubePlaying':
			data.push(ed.track.id);
			data.push(JSON.stringify(ed.track.title));
			break;
		default:
			data.push(JSON.stringify(ed));
			break;
	}
	if(specificFields) {
		specificFields.forEach(field => {
			data.push(JSON.stringify(ed[field]));
		});
	}

	return data.join(' ');
}

app.listen(port, () => {
	console.log(`Listening ${port}…`);
});
