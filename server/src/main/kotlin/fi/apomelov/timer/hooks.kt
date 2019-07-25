package fi.apomelov.timer

import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jnativehook.GlobalScreen
import org.jnativehook.keyboard.NativeKeyEvent
import org.jnativehook.keyboard.NativeKeyListener
import org.jnativehook.mouse.NativeMouseEvent
import org.jnativehook.mouse.NativeMouseInputListener
import org.jnativehook.mouse.NativeMouseWheelEvent
import org.jnativehook.mouse.NativeMouseWheelListener
import org.springframework.context.annotation.DependsOn
import org.springframework.stereotype.Component
import java.awt.BorderLayout
import java.awt.BorderLayout.*
import java.awt.Color.BLACK
import java.awt.Frame
import java.awt.GridLayout
import java.lang.System.currentTimeMillis
import java.util.concurrent.Semaphore
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy
import javax.swing.*
import javax.swing.BorderFactory.createLineBorder
import javax.swing.BorderFactory.createTitledBorder

const val activityThreshold = 5000L


val semaphore = Semaphore(1)

class WelcomeBackDialog : JDialog(null as Frame?, "Welcome back to your computer!", true) {
    
    init {
        setSize(800, 600)
        setLocation(800, 600)
        defaultCloseOperation = DO_NOTHING_ON_CLOSE
        JPanel().apply {
            layout = BorderLayout(0, 20)
            border = createTitledBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20), null)

            JPanel().apply {
                layout = GridLayout(2, 1, -1, 20)
                add(JLabel("Could you spare a moment to help me account for your time?"))
                add(JLabel("When you were last at your computer, you left me timing ..."))
            }.let { add(it, NORTH)}

            JPanel().apply {
                layout = GridLayout(2, 1, -1, 20)
                JPanel().apply {
                    layout = BorderLayout(0, 0)
                    border = createTitledBorder(createLineBorder(BLACK), "What were you doing while you were gone for ...?")
                    JPanel().apply {
                        layout = GridLayout(3, 1, -1, -1)
                        val bg = ButtonGroup()
                        listOf(
                            JRadioButton("Nothing you should be concerned about"),
                            JRadioButton("Task:").apply {
                                isSelected = true
                            }
                        ).forEach {
                            add(it)
                            bg.add(it)
                        }
                    }.let { add(it, WEST) }
                }.let(this::add)
                JPanel().apply {
                    layout = BorderLayout(0, 0)
                    border = createTitledBorder(createLineBorder(BLACK), "What are you about to start working on now?")
                    JPanel().apply {
                        layout = GridLayout(3, 1, -1, -1)
                        val bg = ButtonGroup()
                        listOf(
                                JRadioButton("Don't start timing anything else"),
                                JRadioButton("Continue timing the task I was working on while away"),
                                JRadioButton("Task:").apply {
                                    isSelected = true
                                }
                        ).forEach {
                            add(it)
                            bg.add(it)
                        }
                    }.let { add(it, WEST) }
                }.let(this::add)
            }.let { add(it, CENTER) }
            
            JPanel().apply {
                layout = BorderLayout(0, 0)
                JButton().apply {
                    text = "OK"
                    addActionListener { onOK() }
                    this@WelcomeBackDialog.getRootPane().defaultButton = this
                }.let { add(it, EAST) }
            }.let { add(it, SOUTH) }

        }.let(this::setContentPane)

        pack()
        isVisible = true
    }


    private fun onOK() {
        semaphore.release()
        dispose()
    }

}


//@Component
//@DependsOn("database", "liquibase")
class GlobalEventHook : NativeMouseInputListener, NativeMouseWheelListener, NativeKeyListener {

    @Volatile
    var lastActivity: Long = 0L

    override fun nativeMousePressed(e: NativeMouseEvent) = processEvent()
    override fun nativeMouseMoved(e: NativeMouseEvent) = processEvent()
    override fun nativeMouseReleased(e: NativeMouseEvent) = processEvent()
    override fun nativeMouseDragged(e: NativeMouseEvent) = processEvent()
    override fun nativeMouseClicked(e: NativeMouseEvent) = processEvent()

    override fun nativeMouseWheelMoved(r: NativeMouseWheelEvent) = processEvent()

    override fun nativeKeyTyped(e: NativeKeyEvent?) = processEvent()
    override fun nativeKeyPressed(e: NativeKeyEvent?) = processEvent()
    override fun nativeKeyReleased(e: NativeKeyEvent?) = processEvent()


    private fun processEvent() {
        val curr = currentTimeMillis()
        if (curr - lastActivity < activityThreshold) {
            lastActivity = curr
        } else {
            if (semaphore.tryAcquire()) {
                lastActivity = curr
//                WelcomeBackDialog()
            }
        }
    }

    @PostConstruct
    fun registerHooks() {
        transaction {
            lastActivity = LastActivity.selectAll().first()[LastActivity.lastActivity].millis
        }
        GlobalScreen.registerNativeHook()
        GlobalScreen.addNativeMouseListener(this)
        GlobalScreen.addNativeMouseMotionListener(this)
    }

    @PreDestroy
    fun removeHooks() {
        GlobalScreen.removeNativeMouseListener(this)
        GlobalScreen.removeNativeMouseMotionListener(this)
    }

}