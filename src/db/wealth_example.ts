// Example usage in queries
// Insert
// const insertDate = new Date();
// const { year, month } = dateToYearMonth(insertDate);
// const insertResult = await db.insert(childTable).values({
//   parentId: 1, // Assuming parent with ID 1 exists
//   year,
//   month,
//   // Other fields...
// });

// Query children for a specific parent and month-year
// const startDate = new Date("2023-01-01");
// const endDate = new Date("2023-12-31");
// const queryResult = await db
//   .select()
//   .from(childTable)
//   .where(
//     and(
//       eq(childTable.parentId, 1),
//       between(childTable.year, startDate.getFullYear(), endDate.getFullYear()),
//       or(
//         and(eq(childTable.year, startDate.getFullYear()), gte(childTable.month, startDate.getMonth() + 1)),
//         and(eq(childTable.year, endDate.getFullYear()), lte(childTable.month, endDate.getMonth() + 1)),
//         between(childTable.year, startDate.getFullYear() + 1, endDate.getFullYear() - 1)
//       )
//     )
//   );

// Update
// const updateDate = new Date();
// const { year: updateYear, month: updateMonth } = dateToYearMonth(updateDate);
// const updateResult = await db
//   .update(childTable)
//   .set({
//     /* fields to update */
//   })
//   .where(and(eq(childTable.parentId, 1), eq(childTable.year, updateYear), eq(childTable.month, updateMonth)));
