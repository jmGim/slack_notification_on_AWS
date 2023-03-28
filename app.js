// slack attachments:  https://api.slack.com/messaging/composing/layouts
// alarm nodeJS: https://velog.io/@wngud4950/AWS-Lambda%EB%A1%9C-Slack-%EC%9E%90%EB%8F%99%EC%95%8C%EB%A6%BC-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0


const https = require('https');
const url = require('url');
// const request = require('request');
const SLACK_URL = process.env.HOOK_URL;
const CHANNEL = process.env.CHANNEL;





exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
 
    // let body = JSON.parse(event.body);
    console.log('event:', event);
    // console.log('context: ', context);
    
    const snsEvent = event['Records'][0]['Sns'];
    console.log('snsEvent:  ', snsEvent);
    console.log('typeof snsEvent');
    
    const receivedEvent = JSON.parse(snsEvent['Message']);
    console.log('type receivedEvent:    ', typeof receivedEvent);
    console.log('receivedEvent(Message) :  ', receivedEvent);

    
    console.log('detail::  ', receivedEvent['detail']);
    const detailEvent = receivedEvent['detail'];
    
    const userType = detailEvent['userIdentity']['type'];
    const userName = detailEvent['userIdentity']['userName'];
    const receivedEventTime = detailEvent['eventTime'];
    const receivedEventName = detailEvent['eventName'];
    const receivedEventSource = detailEvent['eventSource'];
    
    const receivedSourceIP = detailEvent['sourceIPAddress'];
    const receivedAwsRegion = detailEvent['awsRegion'];
    const receivedEventID = detailEvent['eventID'];
    const receivedEventType = detailEvent['eventType'];
    
    
    const cloudTrailUrl = `https://${receivedAwsRegion}.console.aws.amazon.com/cloudtrail/home?region=${receivedAwsRegion}#/events/${receivedEventID}`;
    
    // console.log('receivedEvent is ready');

    let slackWebhookPayload = {
      "channel": CHANNEL,
      "attachments": [{
        "fallback": "콘솔 알림!!",
        "color": "#af1f16",
        "blocks": [
          {
          "type": "section",
          "fields": [
              {
                "type": "mrkdwn",
                "text": `${userType} - (${userName}) 부터 발생!!  `
              },
              {
                "type": "mrkdwn",
                "text": `접속 리전: ${receivedAwsRegion}, `
              },
              {
                "type": "mrkdwn",
                "text": `접속시간: ${receivedEventTime}, `
              },
              {
                "type": "mrkdwn",
                "text": `이벤트 이름: ${receivedEventName}`
              },
              {
                "type": "mrkdwn",
                "text": `이벤트 소스: ${receivedEventSource}`
              },
              {
                  "type": "mrkdwn",
                  "text": `*소스 IP*   :   ${receivedSourceIP} :   (<https://ko.infobyip.com/ip-${receivedSourceIP}.html|*IP 위치 조회*>)\n`
              }
            ]
          },
          {
            "type": "actions",
            "elements": [
                {
                  "type": "button",
                  "text": { 
                    "type": "plain_text",
                    "text": "상세 내용 확인    :waving_white_flag:"
                  },
                "style": "primary",
                "url": cloudTrailUrl
                }
            ]
            
          },
          {
            "type": "divider"
          }]
    }]
  }

  let requestBody = slackWebhookPayload;
  
  await exports.postSlack(requestBody, SLACK_URL);
    

  return 'Slack Alarm is sent';
	
}



exports.postSlack = async (message, slackUrl) => {
    return await Req(exports.options(slackUrl), message);
}

exports.options = (slackUrl) => {
    const {host, pathname} = new URL(slackUrl);
    return {
        hostname: host,
        path: pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    };
}

function Req(options, data) {

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                resolve(responseBody);
            });
        });

        req.on('error', (err) => {
            console.error(err);
            reject(err);
        });

        req.write(JSON.stringify(data));
        req.end();
    });
}
