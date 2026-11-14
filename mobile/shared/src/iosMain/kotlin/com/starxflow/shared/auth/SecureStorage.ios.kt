package com.starxflow.shared.auth

import platform.Foundation.CFBridgingRelease
import platform.Foundation.CFBridgingRetain
import platform.Foundation.NSData
import platform.Foundation.NSString
import platform.Foundation.NSUTF8StringEncoding
import platform.Foundation.create
import platform.Foundation.dataUsingEncoding
import platform.Security.SecItemAdd
import platform.Security.SecItemCopyMatching
import platform.Security.SecItemDelete
import platform.Security.kSecAttrAccount
import platform.Security.kSecAttrService
import platform.Security.kSecClass
import platform.Security.kSecClassGenericPassword
import platform.Security.kSecMatchLimit
import platform.Security.kSecMatchLimitOne
import platform.Security.kSecReturnData
import platform.Security.kSecValueData
import platform.darwin.OSStatus
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.alloc
import kotlinx.cinterop.memScoped
import kotlinx.cinterop.ptr
import kotlinx.cinterop.value
import platform.CoreFoundation.CFDictionaryCreateMutable
import platform.CoreFoundation.CFDictionarySetValue
import platform.CoreFoundation.kCFBooleanTrue

@OptIn(ExperimentalForeignApi::class)
actual class SecureStorage {
    private val serviceName = "com.starxflow.mobile.vault"

    actual fun getString(key: String): String? {
        val query = CFDictionaryCreateMutable(null, 0, null, null)
        CFDictionarySetValue(query, kSecClass, kSecClassGenericPassword)
        CFDictionarySetValue(query, kSecAttrService, CFBridgingRetain(serviceName as NSString))
        CFDictionarySetValue(query, kSecAttrAccount, CFBridgingRetain(key as NSString))
        CFDictionarySetValue(query, kSecReturnData, kCFBooleanTrue)
        CFDictionarySetValue(query, kSecMatchLimit, kSecMatchLimitOne)

        return memScoped {
            val result = alloc<kotlinx.cinterop.CPointerVar<out kotlinx.cinterop.CPointed>>()
            val status = SecItemCopyMatching(query, result.ptr)
            if (status == 0) {
                val data = CFBridgingRelease(result.value) as? NSData
                data?.let {
                    NSString.create(it, NSUTF8StringEncoding) as String
                }
            } else {
                null
            }
        }
    }

    actual fun putString(key: String, value: String) {
        remove(key)
        val data = (value as NSString).dataUsingEncoding(NSUTF8StringEncoding)
        val query = CFDictionaryCreateMutable(null, 0, null, null)
        CFDictionarySetValue(query, kSecClass, kSecClassGenericPassword)
        CFDictionarySetValue(query, kSecAttrService, CFBridgingRetain(serviceName as NSString))
        CFDictionarySetValue(query, kSecAttrAccount, CFBridgingRetain(key as NSString))
        CFDictionarySetValue(query, kSecValueData, CFBridgingRetain(data))

        SecItemAdd(query, null)
    }

    actual fun remove(key: String) {
        val query = CFDictionaryCreateMutable(null, 0, null, null)
        CFDictionarySetValue(query, kSecClass, kSecClassGenericPassword)
        CFDictionarySetValue(query, kSecAttrService, CFBridgingRetain(serviceName as NSString))
        CFDictionarySetValue(query, kSecAttrAccount, CFBridgingRetain(key as NSString))

        SecItemDelete(query)
    }

    actual fun clearAll() {
        val query = CFDictionaryCreateMutable(null, 0, null, null)
        CFDictionarySetValue(query, kSecClass, kSecClassGenericPassword)
        CFDictionarySetValue(query, kSecAttrService, CFBridgingRetain(serviceName as NSString))

        SecItemDelete(query)
    }
}
