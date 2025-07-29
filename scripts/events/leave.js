module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.0",
	credits: "Imran",
	description: "Notify when a member leaves or gets kicked from the group.",
};

module.exports.run = async function({ api, event, Users, Threads }) {
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	const { threadID } = event;
	const threadData = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
	const userID = event.logMessageData.leftParticipantFbId;

	const userName = global.data.userName.get(userID) || await Users.getNameUser(userID);
	const boxName = global.data.threadInfo.get(threadID)?.threadName || (await api.getThreadInfo(threadID)).threadName;
	const kickerID = event.author;
	const kickerName = kickerID == userID ? null : (global.data.userName.get(kickerID) || await Users.getNameUser(kickerID));

	let message;

	if (kickerID == userID) {
		// User left by themselves
		message = `🔺🎀 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 🎀🔻\n\n★ ${userName} ★\n\n𝗟𝗲𝗳𝘁 𝗼𝘂𝗿 𝗚𝗿𝗼𝘂𝗽:\n➤ ${boxName} ★\n\n😥 𝗪𝗲 𝘄𝗶𝗹𝗹 𝗺𝗶𝘀𝘀 𝘆𝗼𝘂!\n⚠ গ্রুপ এ থাকার যোগ্যতা নাই দেখে লিভ নিয়েছে😎!`;
	} else {
		// User was kicked by someone
		message = `🔺🎀 𝗞𝗜𝗖𝗞𝗘𝗗 🎀🔻\n\n★ ${userName} ★\n\n𝗛𝗮𝘀 𝗯𝗲𝗲𝗻 𝗸𝗶𝗰𝗸𝗲𝗱 𝗳𝗿𝗼𝗺:\n➤ ${boxName} ★\n\n👤 𝗞𝗶𝗰𝗸𝗲𝗱 𝗯𝘆: ${kickerName}\n⚠ বাল পাকনামির কারণে কিক খাইলো😔!`;
	}

	// If custom leave message exists
	if (typeof threadData.customLeave != "undefined" && threadData.customLeave != "") {
		message = threadData.customLeave
			.replace(/\{name}/g, userName)
			.replace(/\{type}/g, (kickerID == userID) ? "ingat sa byahe haha" : "ayan mateluk ka kase haha")
			.replace(/\{boxName}/g, boxName)
			.replace(/\{kickerName}/g, kickerName || "Unknown");
	}

	return api.sendMessage({ body: message }, threadID);
};
