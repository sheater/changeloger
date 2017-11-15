const { capitalizeFirstLetter } = require('./utils');

module.exports = class Commit {
	constructor ({ hash, authorName, authorEmail, date, body }, options) {
		this._options = options;

		this.hash = hash;
		this.authorName = authorName;
		this.authorEmail = authorEmail;
		this.date = date;		

		this._parseBody(body);
	}

	_parseBody (body) {
		const { typeMatchPattern, ticketMatchPattern } = this._options;

		const typeScopeMatch = body.match(typeMatchPattern);
		this.type = typeScopeMatch && typeScopeMatch[1]
			? typeScopeMatch[1]
			: null;
		this.scope = typeScopeMatch && typeScopeMatch[2]
			? capitalizeFirstLetter(typeScopeMatch[2])
			: null;

		const ticketMatch = body.match(ticketMatchPattern);
		this.ticket = ticketMatch && ticketMatch[1]
			? ticketMatch[1]
			: null;

		this.subject = body
			.replace(typeMatchPattern, '')
			.replace(ticketMatchPattern, '')
			.trim();

		this.subject = capitalizeFirstLetter(this.subject);
	}

	_serializeHash () {
		const { cvsTrackerUrl, hashVisibleLength } = this._options;

		if (!hashVisibleLength) {
			return;
		}

		const hashTrunc = this.hash.substring(0, hashVisibleLength);

		if (cvsTrackerUrl) {
			return `[[\`${hashTrunc}\`](${cvsTrackerUrl.replace('{{hash}}', this.hash)})]`;
		}
		else {
			return `[\`${hashTrunc}\`]`;
		}
	}

	_serializeSubject () {
		return this.subject;
	}

	_serializeTicket () {
		const { ticketTrackerUrl } = this._options;

		if (this.ticket) {
			if (ticketTrackerUrl) {
				return `([${this.ticket}](${ticketTrackerUrl.replace('{{ticket}}', this.ticket)}))`;
			}
			else {
				return `(${this.ticket})`;
			}
		}
	}

	_serializeAuthor () {
		return `*${this.authorName}*`;
	}

	serialize () {
		return [
			this._serializeSubject,
			this._serializeHash,
			this._serializeTicket,
			this._serializeAuthor,
		]
			.map((func) => func.call(this))
			.filter((result) => result)
			.join(' ');
	}
}
