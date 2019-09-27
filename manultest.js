model = {
  blah: true,
  farts: false,
  fooooooks: true
}

test = `
<p>hi</p>
<if blah>
  <p>yep</p>
  <if farts>
    <p>eww farts</p>
  </if>
  <else>
    <p>nofarts</p>
  </else>
  <p>fdsfsdfdsf</p>
  <unless fooooooks>
    <p>oopless</p>
  </unless>
  <p>lklkflsd</p>
  <if farts>
    <p>eww farts</p>
  </if>
  <p>fdsfsdfdsf</p>
</if>
<unless sarts>
  <p>nada</p>
</unless>
<p>omg</p>
`

let teddy = require('./teddy')

let result = teddy.render(test, model)

console.log(result)
