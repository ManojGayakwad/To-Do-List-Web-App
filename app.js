const express = require("express");
const bodyParser = require("body-parser");
const mongoose  = require("mongoose");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); //Method is used to access or express static file .

mongoose.connect("mongodb+srv://admin-angela:Test123@cluster0.gqz25.mongodb.net/todoDB",{useNewUrlParser:true});

const itemsSchema ={
    name:String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name:"Welcome to your to-do list"
});
const item2 = new Item({
    name:"Hit the + botton to add newItem."
});
const item3 = new Item({
    name:"<--Hit this to delete added item."
});

const defaultItems =[item1, item2, item3];
const listSchema={
    name:String,
    items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",function(req, res){
    const today = new Date();
    const currentDay = today.getDay();
    const option ={
        weekday:"long",
        day:"numeric",
        month:"long"
    };
    const day = today.toLocaleDateString("en-US", option); //en-US also used instead hi-IN

    Item.find({},function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully inserted items");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {kindOfDay:"Today", newListItems:foundItems});
        }
    });
       
}); 

app.get("/:customListName",function(req, res){
    const customListName = req.params.customListName;
    List.findOne({name:customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItems
                }); 
                list.save();
                res.redirect("/" + customListName);
            }else{
                res.render("list", {kindOfDay:foundList.name, newListItems:foundList.items});
            }
        }
    });


   

});

app.post("/", function(req, res){
   const itemName = req.body.newItem;
   const listName = req.body.list;
   const item = new Item({
    name:itemName
   });
   
   if(listName === "Today"){
    item.save();
    res.redirect("/"); // method is used to reload a page within second.
   }else{
    List.findOne({name:listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    });
   }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }
  
  
  });

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }
app.listen(port, function(){
    console.log("Server has started successfully");
});


