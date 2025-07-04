// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { UsersState } from 'app/types';

export const getUsers = (state: UsersState) => {
  const regex = new RegExp(state.searchQuery, 'i');

  return state.users.filter((user) => {
    return regex.test(user.login) || regex.test(user.email) || regex.test(user.name);
  });
};

export const getInvitees = (state: UsersState) => {
  const regex = new RegExp(state.searchQuery, 'i');

  return state.invitees.filter((invitee) => {
    return regex.test(invitee.name) || regex.test(invitee.email);
  });
};

export const getInviteesCount = (state: UsersState) => state.invitees.length;
export const getUsersSearchQuery = (state: UsersState) => state.searchQuery;
export const getUsersSearchPage = (state: UsersState) => state.searchPage;
