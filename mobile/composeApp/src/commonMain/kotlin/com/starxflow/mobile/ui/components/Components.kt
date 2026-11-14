package com.starxflow.mobile.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.theme.StarXAccentGlow
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderActive
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXChannelEmail
import com.starxflow.mobile.ui.theme.StarXChannelInstagram
import com.starxflow.mobile.ui.theme.StarXChannelSMS
import com.starxflow.mobile.ui.theme.StarXChannelWeb
import com.starxflow.mobile.ui.theme.StarXChannelWhatsApp
import com.starxflow.mobile.ui.theme.StarXCharcoal
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXDarkGreen
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXFreshGreen
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXSecondaryBg
import com.starxflow.mobile.ui.theme.StarXStatusActive
import com.starxflow.mobile.ui.theme.StarXStatusError
import com.starxflow.mobile.ui.theme.StarXStatusInfo
import com.starxflow.mobile.ui.theme.StarXStatusWarning
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary

/**
 * Three-tier Liquid Glass surface hierarchy.
 * SUBTLE: List rows, filter chips, compact tags.
 * PREMIUM: KPI cards, top headers, conversation surfaces, agent containers.
 * FOCAL: Floating navigation dock, dialogs, bottom sheets, takeover banners.
 */
enum class GlassTier {
    SUBTLE, PREMIUM, FOCAL
}

@Composable
fun GlassSurface(
    modifier: Modifier = Modifier,
    tier: GlassTier = GlassTier.PREMIUM,
    shape: Shape = RoundedCornerShape(16.dp),
    content: @Composable () -> Unit
) {
    val backgroundBrush = when (tier) {
        GlassTier.SUBTLE -> Brush.linearGradient(
            colors = listOf(
                Color(0x0FFFFFFF),
                Color(0x0A10B981),
                Color(0x550F1713)
            )
        )
        GlassTier.PREMIUM -> Brush.linearGradient(
            colors = listOf(
                Color(0x1F10B981),
                Color(0x2E14221A),
                Color(0x8A0F1713)
            )
        )
        GlassTier.FOCAL -> Brush.linearGradient(
            colors = listOf(
                Color(0x3810B981),
                Color(0x3D14221A),
                Color(0x9E0B120E)
            )
        )
    }

    val borderColor = when (tier) {
        GlassTier.SUBTLE -> StarXBorder
        GlassTier.PREMIUM -> StarXBorderEmerald
        GlassTier.FOCAL -> StarXBorderActive
    }

    Box(
        modifier = modifier
            .clip(shape)
            .background(backgroundBrush)
            .border(width = 1.dp, color = borderColor, shape = shape)
    ) {
        content()
    }
}

@Composable
fun StarXButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    isSecondary: Boolean = false,
    leadingIcon: ImageVector? = null,
    trailingIcon: ImageVector? = null
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.97f else 1.0f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)
    )

    val shape = RoundedCornerShape(12.dp)
    val backgroundBrush = if (isSecondary) {
        Brush.linearGradient(listOf(StarXElevatedSurface, StarXCharcoal))
    } else {
        Brush.horizontalGradient(listOf(StarXGreen, StarXFreshGreen))
    }

    val contentColor = if (isSecondary) StarXTextPrimary else StarXBlack

    Box(
        modifier = modifier
            .scale(scale)
            .clip(shape)
            .then(
                if (isSecondary) {
                    Modifier.border(1.dp, StarXBorder, shape)
                } else {
                    Modifier
                }
            )
            .background(if (enabled) backgroundBrush else Brush.linearGradient(listOf(Color(0xFF1E2822), Color(0xFF161F1A))))
            .clickable(
                enabled = enabled && !isLoading,
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
            .padding(horizontal = 18.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                color = contentColor,
                strokeWidth = 2.dp
            )
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                if (leadingIcon != null) {
                    Icon(
                        imageVector = leadingIcon,
                        contentDescription = null,
                        tint = contentColor,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(
                    text = text,
                    color = contentColor,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                if (trailingIcon != null) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(
                        imageVector = trailingIcon,
                        contentDescription = null,
                        tint = contentColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun StarXIconButton(
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    tint: Color = StarXTextPrimary,
    badgeCount: Int = 0
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.92f else 1.0f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)
    )

    Box(
        modifier = modifier
            .scale(scale)
            .size(40.dp)
            .clip(CircleShape)
            .background(Color(0x14FFFFFF))
            .border(1.dp, StarXBorder, CircleShape)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = tint,
            modifier = Modifier.size(20.dp)
        )

        if (badgeCount > 0) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .size(14.dp)
                    .clip(CircleShape)
                    .background(StarXGreen),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (badgeCount > 9) "9+" else "$badgeCount",
                    color = StarXBlack,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun StarXTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    label: String? = null,
    leadingIcon: ImageVector? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    isError: Boolean = false,
    errorMessage: String? = null
) {
    Column(modifier = modifier) {
        if (label != null) {
            Text(
                text = label,
                color = StarXTextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 6.dp)
            )
        }

        TextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = StarXTextMuted, fontSize = 14.sp) },
            leadingIcon = if (leadingIcon != null) {
                {
                    Icon(
                        imageVector = leadingIcon,
                        contentDescription = null,
                        tint = StarXTextSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            } else null,
            trailingIcon = trailingIcon,
            visualTransformation = visualTransformation,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = StarXElevatedSurface,
                unfocusedContainerColor = StarXDarkSurface,
                disabledContainerColor = StarXCharcoal,
                cursorColor = StarXGreen,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                disabledIndicatorColor = Color.Transparent,
                focusedTextColor = StarXTextPrimary,
                unfocusedTextColor = StarXTextPrimary
            ),
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    width = 1.dp,
                    color = if (isError) StarXStatusError else StarXBorder,
                    shape = RoundedCornerShape(12.dp)
                )
        )

        if (isError && errorMessage != null) {
            Text(
                text = errorMessage,
                color = StarXStatusError,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp, start = 4.dp)
            )
        }
    }
}

@Composable
fun StarXSearchBar(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "Search...",
    leadingIcon: ImageVector? = null,
    modifier: Modifier = Modifier
) {
    StarXTextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = placeholder,
        leadingIcon = leadingIcon,
        trailingIcon = if (value.isNotEmpty()) {
            {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Clear",
                    tint = StarXTextMuted,
                    modifier = Modifier
                        .size(18.dp)
                        .clickable { onValueChange("") }
                )
            }
        } else null,
        modifier = modifier
    )
}

@Composable
fun StarXCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(16.dp),
    tier: GlassTier = GlassTier.PREMIUM,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val clickableModifier = if (onClick != null) {
        val interactionSource = remember { MutableInteractionSource() }
        val isPressed by interactionSource.collectIsPressedAsState()
        val scale by animateFloatAsState(
            targetValue = if (isPressed) 0.985f else 1.0f,
            animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)
        )
        Modifier
            .scale(scale)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
    } else Modifier

    GlassSurface(
        modifier = modifier.then(clickableModifier),
        tier = tier,
        shape = shape
    ) {
        Box(modifier = Modifier.padding(16.dp)) {
            content()
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String? = null,
    changePercent: String? = null,
    isPositive: Boolean = true,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    StarXCard(modifier = modifier, onClick = onClick) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    color = StarXTextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                if (icon != null) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(Color(0x1F10B981)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = StarXGreen,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = value,
                color = StarXTextPrimary,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            if (changePercent != null || subtitle != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (changePercent != null) {
                        Text(
                            text = changePercent,
                            color = if (isPositive) StarXGreen else StarXStatusError,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                    if (subtitle != null) {
                        Text(
                            text = subtitle,
                            color = StarXTextMuted,
                            fontSize = 11.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatusIndicator(
    status: String,
    modifier: Modifier = Modifier
) {
    val (color, label) = when (status.lowercase()) {
        "active", "qualified", "confirmed", "completed", "paid", "indexed", "running" ->
            StarXStatusActive to status.replaceFirstChar { it.uppercase() }
        "needs_attention", "contacted", "processing", "pending", "scheduled", "draft" ->
            StarXStatusWarning to status.replaceFirstChar { it.uppercase() }
        "lost", "cancelled", "failed", "unpaid", "paused", "no_show" ->
            StarXStatusError to status.replaceFirstChar { it.uppercase() }
        "whatsapp" -> StarXChannelWhatsApp to "WhatsApp"
        "instagram" -> StarXChannelInstagram to "Instagram"
        "email" -> StarXChannelEmail to "Email"
        "sms" -> StarXChannelSMS to "SMS"
        "web" -> StarXChannelWeb to "Web Chat"
        else -> StarXTextMuted to status.replaceFirstChar { it.uppercase() }
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.12f))
            .border(1.dp, color.copy(alpha = 0.25f), RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(color)
        )
        Spacer(modifier = Modifier.width(5.dp))
        Text(
            text = label,
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun StarXAvatar(
    name: String,
    size: Dp = 38.dp,
    channel: String? = null,
    modifier: Modifier = Modifier
) {
    val initial = name.trim().take(1).uppercase().ifEmpty { "S" }
    val avatarBg = remember(name) {
        val hash = name.hashCode()
        when (hash % 3) {
            0 -> Brush.linearGradient(listOf(StarXGreen, StarXDarkGreen))
            1 -> Brush.linearGradient(listOf(StarXElevatedSurface, StarXCharcoal))
            else -> Brush.linearGradient(listOf(Color(0xFF1E3A2F), Color(0xFF11221B)))
        }
    }

    Box(modifier = modifier.size(size)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(size)
                .clip(CircleShape)
                .background(avatarBg)
                .border(1.dp, StarXBorderEmerald, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = initial,
                color = StarXTextPrimary,
                fontSize = (size.value * 0.4f).sp,
                fontWeight = FontWeight.Bold
            )
        }

        if (channel != null) {
            val channelColor = when (channel.lowercase()) {
                "whatsapp" -> StarXChannelWhatsApp
                "instagram" -> StarXChannelInstagram
                "email" -> StarXChannelEmail
                "sms" -> StarXChannelSMS
                else -> StarXGreen
            }
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size((size.value * 0.35f).dp)
                    .clip(CircleShape)
                    .background(channelColor)
                    .border(1.5.dp, StarXBlack, CircleShape)
            )
        }
    }
}

@Composable
fun StarXFilterChip(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    badgeCount: Int? = null
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(if (isPressed) 0.94f else 1.0f)

    Box(
        modifier = modifier
            .scale(scale)
            .clip(RoundedCornerShape(20.dp))
            .background(if (isSelected) StarXGreen else StarXDarkSurface)
            .border(
                1.dp,
                if (isSelected) StarXBorderEmerald else StarXBorder,
                RoundedCornerShape(20.dp)
            )
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
            .padding(horizontal = 14.dp, vertical = 7.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = label,
                color = if (isSelected) StarXBlack else StarXTextSecondary,
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
            )
            if (badgeCount != null && badgeCount > 0) {
                Spacer(modifier = Modifier.width(6.dp))
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(if (isSelected) StarXBlack.copy(alpha = 0.2f) else StarXGreen.copy(alpha = 0.2f))
                        .padding(horizontal = 5.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = "$badgeCount",
                        color = if (isSelected) StarXBlack else StarXGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun AIResponseSuggestionChip(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0x1F10B981))
            .border(1.dp, StarXBorderEmerald, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "✨",
            fontSize = 11.sp
        )
        Spacer(modifier = Modifier.width(5.dp))
        Text(
            text = text,
            color = StarXFreshGreen,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun EmptyState(
    title: String,
    description: String,
    icon: ImageVector? = null,
    actionButtonText: String? = null,
    onActionClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (icon != null) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(Color(0x14FFFFFF))
                    .border(1.dp, StarXBorder, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = StarXTextSecondary,
                    modifier = Modifier.size(28.dp)
                )
            }
            Spacer(modifier = Modifier.height(14.dp))
        }

        Text(
            text = title,
            color = StarXTextPrimary,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = description,
            color = StarXTextSecondary,
            fontSize = 13.sp,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
        )

        if (actionButtonText != null && onActionClick != null) {
            Spacer(modifier = Modifier.height(16.dp))
            StarXButton(
                text = actionButtonText,
                onClick = onActionClick
            )
        }
    }
}

@Composable
fun ErrorState(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = message,
            color = StarXStatusError,
            fontSize = 13.sp,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(12.dp))
        StarXButton(
            text = "Retry",
            onClick = onRetry,
            isSecondary = true
        )
    }
}

@Composable
fun LoadingState(
    message: String = "Loading...",
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(32.dp),
            color = StarXGreen,
            strokeWidth = 2.5.dp
        )
        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = message,
            color = StarXTextSecondary,
            fontSize = 13.sp
        )
    }
}

@Composable
fun StarXTopBar(
    title: String,
    subtitle: String? = null,
    navigationIcon: ImageVector? = null,
    onNavigationClick: (() -> Unit)? = null,
    actions: @Composable (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    GlassSurface(
        tier = GlassTier.PREMIUM,
        shape = RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (navigationIcon != null && onNavigationClick != null) {
                    StarXIconButton(
                        icon = navigationIcon,
                        onClick = onNavigationClick
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                }
                Column {
                    Text(
                        text = title,
                        color = StarXTextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (subtitle != null) {
                        Text(
                            text = subtitle,
                            color = StarXTextSecondary,
                            fontSize = 12.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            if (actions != null) {
                actions()
            }
        }
    }
}
