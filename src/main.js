import craftai from 'craft-ai-client-js';
import loadCfg from './loadCfg';

const ALARM_SWITCH_LOWER_BOUND = 1500;
const ALARM_SWITCH_UPPER_BOUND = 10000;

loadCfg()
  .then(config => craftai(config))
  .then(instance => {
    console.log(`'${instance.id}' successfully created!`);
    return instance.createAgent('bts/alarm.bt')
      .then(agent => console.log(`agent #${agent.id} created.`))
      .then(() => instance.registerAction(
        'WaitForAlarmStateChange',
        (requestId, agentId, input, success, failure) => {
          console.log(`#${agentId}: "Waiting for alarm state change."`);
          setTimeout(() => {
            let newState = !input.previousState;
            if (newState) {
              console.log(`#${agentId}: "Alarm started."`);
            }
            else {
              console.log(`#${agentId}: "Alarm stopped."`);
            }

            success({
              state: newState
            });
          }, Math.floor(Math.random() * (ALARM_SWITCH_UPPER_BOUND - ALARM_SWITCH_LOWER_BOUND + 1) + ALARM_SWITCH_LOWER_BOUND))
        }))
      .then(() => console.log(`'WaitForAlarmStateChange' registered`))
      .then(() => instance.registerAction(
        'NotifyAlarm',
        (requestId, agentId, input, success, failure) => {
          console.log(`#${agentId}: "Alarm Confirmed!"`);
          success();
        }))
      .then(() => console.log(`'NotifyAlarm' registered`))
      .then(() => instance.update(500))
      .catch((err) => {
        console.log(`Error during the instance lifetime, check 'https://workbench.craft.ai/instances/${instance.cfg.owner}/${instance.cfg.name}/${instance.cfg.version}/${instance.id}/monitor' for further information.`);
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(`Error during instance creation.`);
    console.log(err);
  });
