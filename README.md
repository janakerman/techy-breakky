# Document Design

PK              SK (GSI PK)     D (GSI SK)      Additional Fields
OfficeName      OfficeName      Items
OfficeName      BreakfastId     0
BreakfastId     BreakfastId     Date
BreakfastId     UserId          Item

# Data Constraints
1. Cannot create two breakfasts for the same office on the same day.
2. Cannot create two offices with the same name.
3. Cannot create two orders for a given user for a breakfast.

# Data Access Requirements

1. Get an office/breakfast/order - MAIN: PK = {ID_OF_ITEM} & SK = {ID_OF_ITEM}
2. Get all breakfasts for a given office - MAIN: PK = OfficeName & SK BEGINS_WITH(SortKey, BREAKFAST)
3. Get all orders for a given breakfast - MAIN: PK = BreakfastId & SK BEGINS_WITH(SortKey, USER)
4. Get all orders for a user - GSI: PK = UserId


# Data Column Information

BreakfastId - composite of Office and Date e.g `BREAKFAST-London-20-06-2018`




