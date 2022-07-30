const userFields = ['name', 'mobile_number', 'email', 'password']
const taskFields = ['title', 'description', 'completed']
const userCheckPost = (req) => {
    const given = Object.keys(req.body);
    const isValid = given.every(field=>userFields.includes(field))
    return isValid;
}
const taskCheckPost = (req) => {
    const given = Object.keys(req.body);
    const isValid = given.every(field=>taskFields.includes(field))
    return isValid;
}
module.exports = {userCheckPost, taskCheckPost, userFields, taskFields};
