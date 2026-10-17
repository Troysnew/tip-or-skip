Pod::Spec.new do |s|
  s.name           = 'ReceiptReader'
  s.version        = '1.0.0'
  s.summary        = 'Reads receipt text on the device with Apple Vision'
  s.description    = 'Reads receipt text on the device with Apple Vision and returns lines with corner points'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
