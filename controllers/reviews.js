const Character = require('../models/character');


module.exports = {
    create,
    delete: deleteReview,
    edit,
    update,
}

function create (req,res) {
    // First, find the character we are adding a review to
    Character.findOne({apiId: req.params.id}, function (err, character) {
        // add the user properties to the review(req.body) being created 
        req.body.user = req.user._id;
        req.body.userName = req.user.name;
        req.body.userAvatar = req.user.avatar;
        // add the review to the character.reviews array
        character.reviews.push(req.body);
        // save the parent document
        character.save(function(err) {
            // handle errors first
            if (err) console.log(err);
            // then, respond with a redirect
            res.redirect(`/characters/${character.apiId}`);
        })
    })
}

function deleteReview (req,res,next) {
   // Note the cool "dot" syntax to query on the property of a subdoc
   Character.findOne({'reviews._id' : req.params.id})
   .then(function(character) {
       // find the review subdoc using the id method on Mongoose arrays
       const review = character.reviews.id(req.params.id);
       // Ensure that the review was created by the logged in user
       if (!review.user.equals(req.user._id)) return res.direct(`/characters/${character.apiId}`);
       // Remove the review using the remove method of the subdoc
       review.remove();
       // Save the updated character
       character.save().then(function() {
           // Redirect back to the character's show view
           res.redirect(`/characters/${character.apiId}`);
       }).catch(function(err) {
           return next(err);
       })
   })
}

function edit (req,res) {
    // Note the cool "dot" syntax to query on the property of a subdoc
    Character.findOne({'reviews._id': req.params.id}).then(function(character) {
        // cant access properties of character.reviews
        console.log(` character.reviews: ${character.reviews}`) ;
        console.log(` character.reviews.content: ${character.reviews.content}`) ;
        console.log(` character.reviews.rating: ${character.reviews.rating}`);
        console.log(` character.reviews.userName: ${character.reviews.userName}`);
        res.render('characters/reviews/edit', {title:"Edit review", character});
    })
}

function update (req,res) {
    console.log(req.body);
    Character.findOne({'reviews._id': req.params.id}, function (err, character) {
        console.log(character);
        const reviewSubdoc = character.reviews.id(req.params.id);
        if (!reviewSubdoc.userId.equals(req.user._id)) return res.redirect(`/characters/${character.apiId}`);
        reviewSubdoc.text = req.body.text;
        console.log(reviewSubdoc.text)
        character.save(function(err) {
            console.log(character.reviews);
            res.redirect(`/characters/${character.apiId}`);
        })
    })
}