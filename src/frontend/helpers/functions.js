// pulling userCount for this country
export const getUserCount = (input, level) => {
  let gaps = [100, 250, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7500, 10000, 12500, 15000, 20000, 25000]
  if (level === 'constituency') {
    gaps = [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 8000, 900, 1000, 2000, 3000]
  }
  const gapslen = gaps.length;
  let userCount = input;
  let nextUserCount = gaps[gapslen - 1];
  if (!input || input < gaps[0]) {
    if (level === 'country') {
      userCount = 101;
    } else {
      userCount = 51;
    }
  } // if userCount is not available, fall back to 100
  userCount = parseInt(userCount);

  if (userCount > gaps[gapslen - 1]) {
    userCount = gaps[gapslen - 1];
    nextUserCount = gaps[gapslen - 1] + 5000;
  }
  else {
    for (let i = gapslen - 1; i > -1 ; i--) {
      if (userCount > gaps[i]) {
        userCount = gaps[i];
        nextUserCount = gaps[i+1];
        break;
      }
    }
  }
  return {userCount, nextUserCount}
}

// pulling userCount for this constituency - fewer than
export const getUserCountGB_fewer = (input) => {
  const gaps = [10, 25, 50]
  const gapslen = gaps.length;
  let userCount = input;

  if (!input || input < gaps[0]) { userCount = 11; } // if userCount is not available, fall back to 100
  userCount = parseInt(userCount);

  if (userCount < gaps[gapslen - 1]) {
    for (let i = 0; i < gapslen ; i++) {
      if (userCount < gaps[i]) {
        userCount = gaps[i];
        break;
      }
    }
  }
  return userCount;
}

// pulling userCount for this constituency - 2 thresholds
export const getUserCountGB_low = (input) => {
  const gapslen = gaps.length;
  let userCount = input;
  let nextUserCount = gaps[gapslen - 1];
  if (!input || input < gaps[0]) { userCount = 101; } // if userCount is not available, fall back to 100
  userCount = parseInt(userCount);

  if (userCount > gaps[gapslen - 1]) {
    userCount = gaps[gapslen - 1];
    nextUserCount = gaps[gapslen - 1] + 5000;
  }
  else {
    for (let i = gapslen - 1; i > -1 ; i--) {
      if (userCount > gaps[i]) {
        userCount = gaps[i];
        nextUserCount = gaps[i+1];
        break;
      }
    }
  }
  return {userCount, nextUserCount}
}
