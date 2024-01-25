export const filterUserData = async (data: any) => {
  return {
    name: data.name,
    email: data.email,
    profileImage: data.profileImage,
    showDocuments: data.showDocuments,
    showBooks: data.showBooks,
  };
};

export const filterOutPassword = (array: Array<any>) => {
  const filtered = array.map((data: any) => {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      accountId: data.accountId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
  return filtered;
};
