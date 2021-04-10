import "toastify-js/src/toastify.css"
import Toastify from 'toastify-js'

export default {
  success: (text) => Toastify({
    text: text ?? "Success",
    backgroundColor: "green",
    duration: 5000,
  }).showToast(),

  error: (text) => Toastify({
    text: text ?? "Failed",
    backgroundColor: "red",
    duration: 5000,
  }).showToast()
}