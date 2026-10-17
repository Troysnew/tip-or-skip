import ExpoModulesCore
import UIKit
import Vision

/// Reads the text on a receipt photo with Apple Vision, entirely on the phone.
/// Returns every text line with its box and its four corner points (clockwise from the
/// top-left of the text) in pixels of the upright image, with the origin at the top-left.
public class ReceiptReaderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReceiptReader")

    AsyncFunction("readText") { (uri: String, promise: Promise) in
      let path = URL(string: uri).flatMap { $0.isFileURL ? $0.path : nil } ?? uri
      guard let image = UIImage(contentsOfFile: path), let cgImage = image.cgImage else {
        promise.reject("IMAGE_LOAD_FAILED", "Couldn't open the photo.")
        return
      }

      let orientation = ReceiptReaderModule.orientation(image.imageOrientation)
      let turned: [CGImagePropertyOrientation] = [.left, .right, .leftMirrored, .rightMirrored]
      let sideways = turned.contains(orientation)
      let width = CGFloat(sideways ? cgImage.height : cgImage.width)
      let height = CGFloat(sideways ? cgImage.width : cgImage.height)

      // Vision uses normalized coordinates with the origin at the bottom-left.
      func point(_ p: CGPoint) -> [Double] {
        return [Double(p.x * width), Double((1 - p.y) * height)]
      }

      let request = VNRecognizeTextRequest { request, error in
        if let error = error {
          promise.reject("READ_FAILED", error.localizedDescription)
          return
        }
        let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
        var lines: [[String: Any]] = []
        for obs in observations {
          guard let top = obs.topCandidates(1).first else { continue }
          let box = obs.boundingBox
          lines.append([
            "text": top.string,
            "x": Double(box.minX * width),
            "y": Double((1 - box.maxY) * height),
            "w": Double(box.width * width),
            "h": Double(box.height * height),
            "corners": [point(obs.topLeft), point(obs.topRight), point(obs.bottomRight), point(obs.bottomLeft)],
          ])
        }
        promise.resolve(["width": Double(width), "height": Double(height), "lines": lines])
      }
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = true
      request.recognitionLanguages = ["en-US"]

      DispatchQueue.global(qos: .userInitiated).async {
        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])
        do {
          try handler.perform([request])
        } catch {
          promise.reject("READ_FAILED", error.localizedDescription)
        }
      }
    }
  }

  private static func orientation(_ o: UIImage.Orientation) -> CGImagePropertyOrientation {
    switch o {
    case .up: return .up
    case .down: return .down
    case .left: return .left
    case .right: return .right
    case .upMirrored: return .upMirrored
    case .downMirrored: return .downMirrored
    case .leftMirrored: return .leftMirrored
    case .rightMirrored: return .rightMirrored
    @unknown default: return .up
    }
  }
}
