angular
    .module('Sir')
    .controller('GiftProposalCtrl', GiftProposalCtrl);

function GiftProposalCtrl ($scope, $reactive, $stateParams) {
    $reactive(this).attach($scope);

    var trackId = $stateParams.trackId;
    var track = Tracks.findOne(trackId);
    

    if(suggestGift(track)){
        var suggestion = suggestGift(track);
    }

    this.helpers({
        suggestion() { return suggestion }
    });

    this.suggestAnotherGift = () => {
        track = Tracks.findOne(trackId);
        if(suggestGift(track)){
        this.suggestion = suggestGift(track);
        }
        else {
            this.suggestion.name = "We don't have a gift for you at the moment";
        }
    };

    function suggestGift(track) {
        var gifts = findGifts(track).fetch();
        var randomGift = gifts[Math.floor(Math.random() * gifts.length)]
        Tracks.update(track._id, { $push: {
            suggestions: randomGift
        }});
        return randomGift;
    }

    function findGifts(search) {
        var query = {$and: []};

        if(search.age) {
            query.$and.push({"age.min":{ $lte: search.age}});
            query.$and.push({"age.max":{ $gte: search.age}});
        }

        if(search.price) {
            var price = {$and: []};
            if (search.price.min) {
                price.$and.push({"price" : {$gte: search.price.min}})
            }
            if (search.price.max) {
                price.$and.push({"price" : {$lte: search.price.max}})
            }
            query.$and.push(price);
        }

        if(search.gender){
            query.$and.push({$or: [
                {"gender" : search.gender},
                {"gender" : "N"}
            ]});
        }

        if(search.event) {
            query.$and.push({"events.name": search.event});
        }

        if(search.categories) {
            query.$and.push({"categories.name":{ $in: _.pluck(search.categories.yes, 'name')}});
            query.$and.push({"categories.name":{ $nin: _.pluck(search.categories.no, 'name')}});
        }

        if(search.secondary) {
            query.$and.push({"questions.name":{ $in: search.secondary}});
        }
        if(search.suggestions) {
            //query.$and.push({"id":{ $nin: search.suggestions}});
            query.$and.push({"_id":{ $nin: _.pluck(search.suggestions, '_id')}});
        }
        if(search.questions) {
            query.$and.push({"questions.name":{ $nin: _.pluck(search.questions.no, 'name')}});

            // query.$and.push({ "questions": { $elemMatch: { "_id": { $nin: _.pluck(search.questions.no, '_id') } } } });

        }        

        return Gifts.find(query);
    }   


}