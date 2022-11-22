const stripe = Stripe('pk_test_51M2mNpCyYVSsKZLocBS4tO7n9LHMlx7WyeQOaXSzrMLGVESSU1FAsHv8KiJLBfC12R24NbPjtPK1X73uBAYzIhsN00td5UYsmw'); // Your Publishable Key
const elements = stripe.elements();

// Create our card inputs
var style = {
  base: {
    color: "#fff"
  }
};

const card = elements.create('card', { style });
card.mount('#card-element');

const form = document.querySelector('form');
const errorEl = document.querySelector('#card-errors');

// Give our token to our form
const stripeTokenHandler = token => {
  const hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  form.submit();
}

// Create token from card data
form.addEventListener('submit', e => {
  e.preventDefault();
  console.log("(card.js) form submitted");

  stripe.createToken(card).then(res => {
    if (res.error) errorEl.textContent = res.error.message;
    else {
      console.log("res token : " + res.token);
      stripeTokenHandler(res.token);
    }
  })
})