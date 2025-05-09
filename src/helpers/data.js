import { dataTableRecords, pricingData, projectsData
// timelineData,
} from '@/assets/data/other';
import { emailsData, socialGroupsData } from '@/assets/data/social';
import { sleep } from '@/utils/promise';
import * as yup from 'yup';

// export const getNotifications = async (): Promise<NotificationType[]> => {
//   return notificationsData;
// };

// export const getAllTimeline = async (): Promise<TimelineType> => {
//   await sleep();
//   return timelineData;
// };

export const getAllPricingPlans = async () => {
  await sleep();
  return pricingData;
};
export const getJoinedGroups = async () => {
  return socialGroupsData;
};
export const getEmailsCategoryCount = async () => {
  const mailsCount = {
    inbox: 0,
    starred: 0,
    draft: 0,
    sent: 0,
    deleted: 0,
    important: 0
  };
  mailsCount.inbox = emailsData.filter(email => email.toId === '101').length;
  mailsCount.starred = emailsData.filter(email => email.starred).length;
  mailsCount.draft = emailsData.filter(email => email.draft).length;
  mailsCount.sent = emailsData.filter(email => email.fromId === '101').length;
  mailsCount.important = emailsData.filter(email => email.important).length;
  await sleep();
  return mailsCount;
};
export const getAllProjects = async () => {
  await sleep();
  return projectsData;
};
export const serverSideFormValidate = async data => {
  const formSchema = yup.object({
    fName: yup.string().min(3, 'First name should have at least 3 characters').max(50, 'First name should not be more than 50 characters').required('First name is required'),
    lName: yup.string().min(3, 'Last name should have at least 3 characters').max(50, 'Last name should not be more than 50 characters').required('Last name is required'),
    username: yup.string().min(3, 'Username should have at least 3 characters').max(20, 'Username should not be more than 20 characters').required('Username is required'),
    city: yup.string().min(3, 'City should have at least 3 characters').max(20, 'City should not be more than 20 characters').required('City is required'),
    state: yup.string().min(3, 'State should have at least 3 characters').max(20, 'State should not be more than 20 characters').required('State is required'),
    zip: yup.number().required('ZIP is required')
  });
  try {
    const validatedObj = await formSchema.validate(data, {
      abortEarly: false
    });
    return validatedObj;
  } catch (error) {
    return error;
  }
};
export const getAllDataTableRecords = async () => {
  await sleep();
  return dataTableRecords;
};