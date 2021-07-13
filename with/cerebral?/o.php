<link rel="stylesheet" type="text/css" href="../../css/fonts.css">
<link rel="stylesheet" type="text/css" href="../../css/style.css">
<?php
//$username = "123"; //Change to whatever you want your username to be
$password = "broccoli"; //Change to whatever you want your password to be
 
if(isset($_POST['submit'])){
    if(/*$_POST['username'] == $username && */$_POST['password'] == $password){
        //EXECUTE YOUR CODE HERE
        //echo "welcome to the password protected area!";
        include("crb.html");
        } else {
        echo "incorrect password";
        }
} else { //IF THE FORM WAS NOT SUBMITTED
//SHOW FORM
    ?>
    
    <form method="post">
        <!--Username: <input type="text" name="username" /><br />-->
        Password: <input type="password" name="password" />
        <input type='submit' name='submit' />
    </form>
    <?php
}
 
 
?>