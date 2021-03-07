#!/usr/local/bin/node

'use strict';
const alfy = require('alfy');
const axios = require('axios');

const host = alfy.config.get('host');
const auth = alfy.config.get('auth');

async function queryAll() {
	const cacheKey = "bambooQueryData";
	const data = alfy.cache.get(cacheKey);
	if (data) {
		return data;
	}

	const result = await axios.get(`${host}/rest/api/latest/plan?max-result=3000`,
			{
				headers: {
					authorization: `Basic ${auth}`,
					accept: 'application/json'
				}
			});
	const plans = result.data.plans.plan;
	alfy.cache.set(cacheKey, plans, {maxAge: 1000 * 60 * 5})
	return plans;
}

queryAll().then(data => {
	const items = alfy
	.matches(alfy.input, data, 'name')
	.map(x => ({
		title: x.name,
		subtitle: x.shortName,
		arg: x['link'].href.substring(0, x['link'].href.lastIndexOf("/rest"))
				+ '/browse/' + x['planKey'].key
	}))

	alfy.output(items);
}).catch(error => alfy.error(error));
