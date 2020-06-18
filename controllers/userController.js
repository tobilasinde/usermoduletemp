/**
 * Controller for User.
 * Author: Babatope Olajide.
 * Version: 1.0.0
 * Release Date: 08-April-2020
 * Last Updated: 09-April-2020
 */

/**
 * Module dependencies.
 */
var models = require('../models');

// Display User create form on GET.
exports.getUserCreate = async function(req, res, next) {
    
    // create User GET controller logic here 
    const permissions = await models.Permission.findAll();
    const departments = await models.Department.findAll();
    const roles = await models.Role.findAll();
    const profiles = await models.Profile.findAll();
    const currentBusinesses = await models.CurrentBusiness.findAll();
    
    res.render('pages/content', {
        title: 'Create an User Record',
        permissions: permissions,
        departments: departments,
        roles: roles,
        profiles: profiles,
        currentBusinesses: currentBusinesses,
        functioName: 'GET USER CREATE',
        layout: 'layouts/detail'
    });
    console.log("renders User create form successfully")
};

// Handle User create on POST.
exports.postUserCreate = async function(req, res, next) {
    
    // create User POST controller logic here
    // If an User gets created successfully, we just redirect to Users list
    // no need to render a page
  
try {
       var user = await models.User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            username: req.body.username,
            DepartmentId: req.body.department_id,
            ProfileId: req.body.profile_id,
            RoleId: req.body.role_id
        })

        console.log("The user id " + user.id);
        
        var actionType = 'create';
        
        // START MANY TO MANY RELATIONSHIP (USER PERMISSIONS AND CURRENT BUSINESSES)
        
        // INSERT CURRENT BUSINESS MANY TO MANY RELATIONSHIP
        
        var addCurrentBusiness = await CreateOrUpdateCurrentBusiness (req, res, user, actionType);
        
        //addCurrentBusiness should be true if successfull
        if(!addCurrentBusiness) {
            return res.status(422).json({ status: false,  error: 'Error occured while adding business'});
        }
        
        // INSERT PERMISSION MANY TO MANY RELATIONSHIP
        var addPermissions = await CreateOrUpdatePermissions (req, res, user, actionType);
        
        console.log(addPermissions);
        
        if(!addPermissions){
            return res.status(422).json({ status: false,  error: 'Error occured while adding Permissions'});
        }
        
        // END MANY TO MANY 
        
        console.log('User Created Successfully');
    
         // everything done, now redirect....to user created page.
        res.redirect('/main/user/' + user.id);
        
    } catch (error) {
        // we have an error during the process, then catch it and redirect to error page
        console.log("There was an error " + error);
        models.User.destroy({ where: {id: user.id}});
        res.render('pages/error', {
        title: 'Error',
        message: error,
        error: error
      });
    }
};

// Display User delete form on GET.
exports.getUserDelete = function(req, res, next) {
    models.User.destroy({
        where: {
            id: req.params.user_id
        }
    }).then(function() {

        res.redirect('/main/users');
        console.log("User deleted successfully");
    });
};
 
 

// Display User update form on GET.
exports.getUserUpdate = async function(req, res, next) {
    // Find the post you want to update
    const permissions = await models.Permission.findAll();
    const departments = await models.Department.findAll();
    const roles = await models.Role.findAll();
    const profiles = await models.Profile.findAll();
    const currentBusinesses = await models.CurrentBusiness.findAll();
    console.log("ID is " + req.params.user_id);
    models.User.findByPk(
        req.params.user_id,
        {
            include:
            [
                        {
                            model: models.Department 
                        },
                        {
                            model: models.Role,
                            attributes: ['id', 'role_name']
                        },
                        {
                            model: models.Profile,
                            attributes: ['id', 'profile_name']
                        },
                        {
                            model: models.Permission,
                            as: 'permissions',
                            attributes: ['id', 'permission_name']
                        },
                        {
                            model: models.CurrentBusiness,
                            as: 'currentbusinesses',
                            attributes: ['id', 'current_business_name']
                        },
                        
            ]
        }
    ).then(function(user) {
        // renders a post form
        console.log('This is user.Permissions ' + user.permissions[0].id);
        console.log('This is user.CurrentBusiness ' + user.CurrentBusiness);
        console.log('This is the user department ' + user.Department.department_name);
        console.log('This is the user profile ' + user.Profile.id);
        console.log('This is the user role ' + user.Role.role_name);
        
        // for (let i = 0; i < permissions.length; i++) {
        //     if (user.permissions.indexOf(permissions[i].id) > -1) {
        //         permissions[i].checked='true';
        //     }
        // }
                
        res.render('pages/content', {
            title: 'Update User',
            user: user,
            permissions: permissions,
            departments: departments,
            roles: roles,
            profiles: profiles,
            currentBusinesses: currentBusinesses,
            functioName: 'GET USER UPDATE',
            layout: 'layouts/detail'
        });
        console.log("User update get successful");
    });
};

exports.postUserUpdate = async function(req, res, next) {
    console.log("ID is " + req.params.user_id);
    console.log("first_name is " +req.body.first_name);
    console.log("last_name is " + req.body.last_name);
    console.log("email is " +req.body.email);
    console.log("username is " + req.body.username);
    console.log("department_id is " +req.body.department_id);
    console.log("role_id is " +req.body.role_id);
    console.log("profile_id is " +req.body.profile_id);
    
    try {
        
        await models.User.update(
            // Values to update
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                username: req.body.username,
                DepartmentId: req.body.department_id,
                ProfileId: req.body.profile_id,
                RoleId: req.body.role_id
            }, { // Clause
                where: {
                    id: req.params.user_id
                }
            }
        );
        
        
        var user = await models.User.findByPk(req.params.user_id);
        
        console.log('this is user from update ' + user + 'id' + user.id);
        
        var actionType = 'update';
         
        // START MANY TO MANY RELATIONSHIP (USER PERMISSIONS AND CURRENT BUSINESSES)

        // INSERT CURRENT BUSINESS MANY TO MANY RELATIONSHIP
        var updateCurrentBusiness = await CreateOrUpdateCurrentBusiness (req, res, user, actionType);
        
        if(!updateCurrentBusiness) {
            return res.status(422).json({ status: false,  error: 'Error occured while adding business'});
        }
        
        // INSERT PERMISSION MANY TO MANY RELATIONSHIP
        var updatePermissions = await CreateOrUpdatePermissions (req, res, user, actionType);
        
        if(!updatePermissions){
            return res.status(422).json({ status: false,  error: 'Error occured while adding Permissions'});
        }
        
        // END MANY TO MANY 
        
        console.log('User Updated Successfully');
    
         // everything done, now redirect....to user created page.
        res.redirect('/main/user/' + user.id);

    } catch (error) {
        // we have an error during the process, then catch it and redirect to error page
        console.log("There was an error " + error);
        res.render('pages/error', {
        title: 'Error',
        message: error,
        error: error
      });
    }
};

// Display detail page for a specific User.
exports.getUserDetails = async function(req, res, next) {

    const permissions = await models.Permission.findAll();
    const departments = await models.Department.findAll();
    const roles = await models.Role.findAll();
    const profiles = await models.Profile.findAll();
    const currentBusinesses = await models.CurrentBusiness.findAll();

    models.User.findByPk(
        req.params.user_id, {
            include:
            [
                        {
                            model: models.Department 
                        },
                        {
                            model: models.Role
                        },
                        {
                            model: models.Profile
                        },
                        {   model: models.Post},
                        {
                            model: models.Permission,
                            as: 'permissions',
                            attributes: ['id', 'permission_name']
                        },
                        {
                            model: models.CurrentBusiness,
                            as: 'currentbusinesses',
                            attributes: ['id', 'current_business_name']
                        },
                        
            ]
        }
    ).then(function(user) {
        console.log(user);
        res.render('pages/content', {
            title: 'User Details',
            permissions: permissions,
            departments: departments,
            roles: roles,
            profiles: profiles,
            currentBusinesses: currentBusinesses,
            functioName: 'GET USER DETAILS',
            user: user,
            layout: 'layouts/detail'
        });
        console.log("User details renders successfully");
    });
};

// Display list of all Users.
exports.getUserList = async function(req, res, next) {

    models.User.findAll().then(async function(users) {
        console.log("rendering user list");
        res.render('pages/content', {
            title: 'User List',
            users: users,
            functioName: 'GET USER LIST',
            layout: 'layouts/list'
        });
        console.log("Users list renders successfully");
    });
};

async function CreateOrUpdateCurrentBusiness (req, res, user, actionType) {
    
        console.log('user from create update function ' + user)
        
        // get current business id from request
        let currentBusinessId = req.body.current_business_id;
        
        // check if we have that current business that was selected from front end in our database model for current business
        const currentBusiness = await models.CurrentBusiness.findByPk(currentBusinessId);
        
        console.log("This is the current business " + currentBusiness);
        
        // if currentBusiness does not exist - return with status 400
        if (!currentBusiness) {
             // destroy the user we created because we can't find current business selected for the user
             if(actionType == 'create') models.User.destroy({ where: { id: user.id}});
             return res.status(422).json({ status: false,  error: 'Cannot find that current business selected'});
        } 
        
        // remove before add - to update entry inside UserCurrentBusinesses table
        if(actionType == 'update') {
            const oldCurrentBusinesses = await user.getCurrentbusinesses();
            await user.removeCurrentbusiness(oldCurrentBusinesses);
        }
        //otherwise just add
        await user.addCurrentbusiness(currentBusiness);
        
        return true; //transation completed so back to our create post
    
}

async function CreateOrUpdatePermissions(req, res, user, actionType) {

    let permissionList = req.body.permissions;
    
    console.log(permissionList);
    
    console.log('type of permission list is ' + typeof permissionList);
    
    // check the size of the category list
    // console.log(permissionList.length);
    
    // I am checking if permissionList exist
    if (permissionList) { 
        
        // I am checking if only 1 permission has been selected
        // if only one permission then use the simple case scenario for adding permission
        if(permissionList.length === 1) {
            
        // check if we have that permission that was selected in our database model for permission
        const permission = await models.Permission.findByPk(permissionList);
        
        console.log("These are the permissions " + permission);
        
        // check if permission exists
        if (!permission) {
            // destroy the user we created
             if(actionType == 'create') models.User.destroy({ where: {id: user.id}});
             return res.status(422).json({ status: false,  error: 'Cannot find that permission selected'});
        }
        
        //  remove association before update new entry inside UserPermission table if it exist
        if(actionType == 'update') {
            const oldPermissions = await user.getPermissions();
            await user.removePermissions(oldPermissions);
        }
        await user.addPermission(permission);
        return true;
    
    }
    
    // Ok now lets do for more than 1 permissions, the hard bit.
    // if more than one permissions have been selected
    else {
        
        if(typeof permissionList === 'object') {
            // Loop through all the ids in req.body.permissions i.e. the selected permissions
            await permissionList.forEach(async (id) => {
                // check if all permission selected are in the database
                const permission = await models.Permission.findByPk(id);
                
                if (!permission) {
                    // return res.status(400);
                    // destroy the user we created
                    if(actionType == 'create') models.User.destroy({ where: {id: user.id}});
                    return res.status(422).json({ status: false,  error: 'Cannot find that permission selected'});
                }
                
                // remove association before if update
                if(actionType == 'update') {
                    const oldPermissions = await user.getPermissions();
                    await user.removePermissions(oldPermissions);
                }
                 await user.addPermission(permission);
            });
            
            return true;
            
        } else {
            // destroy the user we created
            if(actionType == 'create') models.User.destroy({ where: {id: user.id}});
            return res.status(422).json({ status: false,  error: 'Type of permission list is not an object'});
        }
    }} else {
            if(actionType == 'create') { models.User.destroy({ where: {id: user.id}});}
            return res.status(422).json({ status: false,  error: 'No permission selected'});
        }
    
}/**
 * Controller for User.
 * Author: Babatope Olajide.
 * Version: 1.0.0
 * Release Date: 08-April-2020
 * Last Updated: 09-April-2020
 */

/**
 * Module dependencies.
 */
var models = require('../models');

// Display User create form on GET.
exports.getUserCreate = async function(req, res, next) {
    
    // create User GET controller logic here 
    const permissions = await models.Permission.findAll();
    const departments = await models.Department.findAll();
    const roles = await models.Role.findAll();
    const profiles = await models.Profile.findAll();
    const currentBusinesses = await models.CurrentBusiness.findAll();
    
    res.render('pages/content', {
        title: 'Create an User Record',
        permissions: permissions,
        departments: departments,
        roles: roles,
        profiles: profiles,
        currentBusinesses: currentBusinesses,
        functioName: 'GET USER CREATE',
        layout: 'layouts/detail'
    });
    console.log("renders User create form successfully")
};

// Handle User create on POST.
exports.postUserCreate = async function(req, res, next) {
    
    // create User POST controller logic here
    // If an User gets created successfully, we just redirect to Users list
    // no need to render a page
  
try {
       var user = await models.User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            username: req.body.username,
            DepartmentId: req.body.department_id,
            ProfileId: req.body.profile_id,
            RoleId: req.body.role_id
        })

        console.log("The user id " + user.id);
        
        var actionType = 'create';
        
        // START MANY TO MANY RELATIONSHIP (USER PERMISSIONS AND CURRENT BUSINESSES)
        
        // INSERT CURRENT BUSINESS MANY TO MANY RELATIONSHIP
        var addCurrentBusiness = await CreateOrUpdateCurrentBusiness (req, res, user, actionType);
        
        if(!addCurrentBusiness) {
            return res.status(422).json({ status: false,  error: 'Error occured while adding business'});
        }
        
        // INSERT PERMISSION MANY TO MANY RELATIONSHIP
        var addPermissions = await CreateOrUpdatePermissions (req, res, user, actionType);
        
        console.log(addPermissions);
        
        if(!addPermissions){
            return res.status(422).json({ status: false,  error: 'Error occured while adding Permissions'});
        }
        
        // END MANY TO MANY 
        
        console.log('User Created Successfully');
    
         // everything done, now redirect....to user created page.
        res.redirect('/main/user/' + user.id);
        
    } catch (error) {
        // we have an error during the process, then catch it and redirect to error page
        console.log("There was an error " + error);
        models.User.destroy({ where: {id: user.id}});
        res.render('pages/error', {
        title: 'Error',
        message: error,
        error: error
      });
    }
};

// Display User delete form on GET.
exports.getUserDelete = function(req, res, next) {
    models.User.destroy({
        where: {
            id: req.params.user_id
        }
    }).then(function() {

        res.redirect('/main/users');
        console.log("User deleted successfully");
    });
};
 
 

// Display User update form on GET.
exports.getUserUpdate = async function(req, res, next) {
    // Find the post you want to update
    const permissions = await models.Permission.findAll();
    const departments = await models.Department.findAll();
    const roles = await models.Role.findAll();
    const profiles = await models.Profile.findAll();
    const currentBusinesses = await models.CurrentBusiness.findAll();
    console.log("ID is " + req.params.user_id);
    models.User.findByPk(
        req.params.user_id,
        {
            include:
            [
                        {
                            model: models.Department 
                        },
                        {
                            model: models.Role,
                            attributes: ['id', 'role_name']
                        },
                        {
                            model: models.Profile,
                            attributes: ['id', 'profile_name']
                        },
                        {
                            model: models.Permission,
                            as: 'permissions',
                            attributes: ['id', 'permission_name']
                        },
                        {
                            model: models.CurrentBusiness,
                            as: 'currentbusinesses',
                            attributes: ['id', 'current_business_name']
                        },
                        
            ]
        }
    ).then(function(user) {
        // renders a post form
        console.log('This is user.Permissions ' + user.permissions[0].id);
        console.log('This is user.CurrentBusiness ' + user.CurrentBusiness);
        console.log('This is the user department ' + user.Department.department_name);
        console.log('This is the user profile ' + user.Profile.id);
        console.log('This is the user role ' + user.Role.role_name);
        
        // for (let i = 0; i < permissions.length; i++) {
        //     if (user.permissions.indexOf(permissions[i].id) > -1) {
        //         permissions[i].checked='true';
        //     }
        // }
                
        res.render('pages/content', {
            title: 'Update User',
            user: user,
            permissions: permissions,
            departments: departments,
            roles: roles,
            profiles: profiles,
            currentBusinesses: currentBusinesses,
            functioName: 'GET USER UPDATE',
            layout: 'layouts/detail'
        });
        console.log("User update get successful");
    });
};

exports.postUserUpdate = async function(req, res, next) {
    console.log("ID is " + req.params.user_id);
    console.log("first_name is " +req.body.first_name);
    console.log("last_name is " + req.body.last_name);
    console.log("email is " +req.body.email);
    console.log("username is " + req.body.username);
    console.log("department_id is " +req.body.department_id);
    console.log("role_id is " +req.body.role_id);
    console.log("profile_id is " +req.body.profile_id);
    
    try {
        
        await models.User.update(
            // Values to update
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                username: req.body.username,
                DepartmentId: req.body.department_id,
                ProfileId: req.body.profile_id,
                RoleId: req.body.role_id
            }, { // Clause
                where: {
                    id: req.params.user_id
                }
            }
        );
        
        
        var user = await models.User.findByPk(req.params.user_id);
        
        console.log('this is user from update ' + user + 'id' + user.id);
        
        var actionType = 'update';
         
        // START MANY TO MANY RELATIONSHIP (USER PERMISSIONS AND CURRENT BUSINESSES)

        // INSERT CURRENT BUSINESS MANY TO MANY RELATIONSHIP
        var updateCurrentBusiness = await CreateOrUpdateCurrentBusiness (req, res, user, actionType);
        
        if(!updateCurrentBusiness) {
            return res.status(422).json({ status: false,  error: 'Error occured while adding business'});
        }
        
        // INSERT PERMISSION MANY TO MANY RELATIONSHIP
        var updatePermissions = await CreateOrUpdatePermissions (req, res, user, actionType);
        
        if(!updatePermissions){
            return res.status(422).json({ status: false,  error: 'Error occured while adding Permissions'});
        }
        
        // END MANY TO MANY 
        
        console.log('User Updated Successfully');
    
         // everything done, now redirect....to user created page.
        res.redirect('/main/user/' + user.id);

    } catch (error) {
        // we have an error during the process, then catch it and redirect to error page
        console.log("There was an error " + error);
        res.render('pages/error', {
        title: 'Error',
        message: error,
        error: error
      });
    }
};

// Display detail page for a specific User.
exports.getUserDetails = async function(req, res, next) {

    const permissions = await models.Permission.findAll();
    const departments = await models.Department.findAll();
    const roles = await models.Role.findAll();
    const profiles = await models.Profile.findAll();
    const currentBusinesses = await models.CurrentBusiness.findAll();

    models.User.findByPk(
        req.params.user_id, {
            include:
            [
                        {
                            model: models.Department 
                        },
                        {
                            model: models.Role
                        },
                        {
                            model: models.Profile
                        },
                        {   model: models.Post},
                        {
                            model: models.Permission,
                            as: 'permissions',
                            attributes: ['id', 'permission_name']
                        },
                        {
                            model: models.CurrentBusiness,
                            as: 'currentbusinesses',
                            attributes: ['id', 'current_business_name']
                        },
                        
            ]
        }
    ).then(function(user) {
        console.log(user);
        //user.Department
        res.render('pages/content', {
            title: 'User Details',
            permissions: permissions,
            departments: departments,
            roles: roles,
            profiles: profiles,
            currentBusinesses: currentBusinesses,
            functioName: 'GET USER DETAILS',
            user: user,
            layout: 'layouts/detail'
        });
        console.log("User details renders successfully");
    });
};

// Display list of all Users.
exports.getUserList = async function(req, res, next) {

    models.User.findAll().then(async function(users) {
        console.log("rendering user list");
        res.render('pages/content', {
            title: 'User List',
            users: users,
            functioName: 'GET USER LIST',
            layout: 'layouts/list'
        });
        console.log("Users list renders successfully");
    });
};

async function CreateOrUpdateCurrentBusiness (req, res, user, actionType) {
    
        console.log('user from create update function ' + user)
        
        // get current business id from request
        let currentBusinessId = req.body.current_business_id;
        
        // check if we have that current business that was selected from front end in our database model for current business
        const currentBusiness = await models.CurrentBusiness.findByPk(currentBusinessId);
        
        console.log("This is the current business " + currentBusiness);
        
        // if currentBusiness does not exist - return with status 400
        if (!currentBusiness) {
             // destroy the user we created because we can't find current business selected for the user
             if(actionType == 'create') models.User.destroy({ where: { id: user.id}});
             return res.status(422).json({ status: false,  error: 'Cannot find that current business selected'});
        } 
        
        // remove before add - to update entry inside UserCurrentBusinesses table
        if(actionType == 'update') {
            const oldCurrentBusinesses = await user.getCurrentbusinesses();
            await user.removeCurrentbusiness(oldCurrentBusinesses);
        }
        //otherwise just add
        await user.addCurrentbusiness(currentBusiness);
        
        return true; //transation completed so back to our create post
    
}

async function CreateOrUpdatePermissions(req, res, user, actionType) {

    let permissionList = req.body.permissions;
    
    console.log(permissionList);
    
    console.log('type of permission list is ' + typeof permissionList);
    
    // check the size of the category list
    // console.log(permissionList.length);
    
    // I am checking if permissionList exist
    if (permissionList) { 
        
        // I am checking if only 1 permission has been selected
        // if only one permission then use the simple case scenario for adding permission
        if(permissionList.length === 1) {
            
        // check if we have that permission that was selected in our database model for permission
        const permission = await models.Permission.findByPk(permissionList);
        
        console.log("These are the permissions " + permission);
        
        // check if permission exists
        if (!permission) {
            // destroy the user we created
             if(actionType == 'create') models.User.destroy({ where: {id: user.id}});
             return res.status(422).json({ status: false,  error: 'Cannot find that permission selected'});
        }
        
        //  remove association before update new entry inside UserPermission table if it exist
        if(actionType == 'update') {
            const oldPermissions = await user.getPermissions();
            await user.removePermissions(oldPermissions);
        }
        await user.addPermission(permission);
        return true;
    
    }
    
    // Ok now lets do for more than 1 permissions, the hard bit.
    // if more than one permissions have been selected
    else {
        
        if(typeof permissionList === 'object') {
            // Loop through all the ids in req.body.permissions i.e. the selected permissions
            await permissionList.forEach(async (id) => {
                // check if all permission selected are in the database
                const permission = await models.Permission.findByPk(id);
                
                if (!permission) {
                    // return res.status(400);
                    // destroy the user we created
                    if(actionType == 'create') models.User.destroy({ where: {id: user.id}});
                    return res.status(422).json({ status: false,  error: 'Cannot find that permission selected'});
                }
                
                // remove association before if update
                if(actionType == 'update') {
                    const oldPermissions = await user.getPermissions();
                    await user.removePermissions(oldPermissions);
                }
                 await user.addPermission(permission);
            });
            
            return true;
            
        } else {
            // destroy the user we created
            if(actionType == 'create') models.User.destroy({ where: {id: user.id}});
            return res.status(422).json({ status: false,  error: 'Type of permission list is not an object'});
        }
    }} else {
            if(actionType == 'create') { models.User.destroy({ where: {id: user.id}});}
            return res.status(422).json({ status: false,  error: 'No permission selected'});
        }
    
}