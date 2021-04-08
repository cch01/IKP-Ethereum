import "toastify-js/src/toastify.css"
import Toastify from 'toastify-js'

export default {
  success: () => Toastify({
    text: "Success",
    backgroundColor: "green",
  }).showToast(),

  failed: () => Toastify({
    text: "Failed",
    backgroundColor: "red"
  })
}