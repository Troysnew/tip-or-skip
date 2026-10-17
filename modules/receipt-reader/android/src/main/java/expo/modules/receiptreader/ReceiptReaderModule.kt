package expo.modules.receiptreader

import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Reads the text on a receipt photo with Google ML Kit, entirely on the phone.
 * Returns every text line with its box and its four corner points (clockwise from the
 * top-left of the text), which carry the line's angle on a tilted photo.
 */
class ReceiptReaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReceiptReader")

    AsyncFunction("readText") { uri: String, promise: Promise ->
      val context = appContext.reactContext
        ?: return@AsyncFunction promise.reject("NO_CONTEXT", "The app isn't ready yet. Try again.", null)

      val image = try {
        InputImage.fromFilePath(context, Uri.parse(uri))
      } catch (e: Exception) {
        return@AsyncFunction promise.reject("IMAGE_LOAD_FAILED", e.localizedMessage ?: "Couldn't open the photo.", e)
      }

      val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
      recognizer.process(image)
        .addOnSuccessListener { result ->
          val lines = mutableListOf<Map<String, Any>>()
          for (block in result.textBlocks) {
            for (line in block.lines) {
              val box = line.boundingBox ?: continue
              val corners = line.cornerPoints?.map { listOf(it.x, it.y) }
              val entry = mutableMapOf<String, Any>(
                "text" to line.text,
                "x" to box.left,
                "y" to box.top,
                "w" to box.width(),
                "h" to box.height()
              )
              if (corners != null && corners.size == 4) entry["corners"] = corners
              lines.add(entry)
            }
          }
          recognizer.close()
          promise.resolve(mapOf("width" to image.width, "height" to image.height, "lines" to lines))
        }
        .addOnFailureListener { e ->
          recognizer.close()
          promise.reject("READ_FAILED", e.localizedMessage ?: "Couldn't read the receipt.", e)
        }
    }
  }
}
