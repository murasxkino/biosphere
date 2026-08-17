import UIKit
import AVFoundation
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        configureAudioSession()
        observeAudioInterruptions()
        return true
    }

    /* ------------------------------ audio session ----------------------------- */

    /*  BIOSPHERE's soundscape is content, not an alert. Left unconfigured, iOS
        treats web audio as ambient and the ring/silent switch mutes the entire
        app — fatal for an ambient app, and the reason APP_STORE_ROADMAP lists
        this as a release blocker rather than a polish item. The `playback`
        category declares the audio intentional: it survives the silent switch,
        and together with the `audio` background mode in Info.plist it lets a
        soundscape and a focus timer outlive the screen locking.

        We set the category but deliberately do not activate the session here.
        Sound only ever begins on a tap (FEATURE_SPEC §4, Autoplay restore), and
        a whole session can be lived through silent — both layers off is a
        supported way to use the app. Activating at launch would cut off
        whatever the user was already listening to before BIOSPHERE had made a
        sound of its own. iOS activates the session implicitly when audio
        actually starts, which is precisely when we want it.                     */
    private func configureAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        } catch {
            /* Enhancement, never requirement: the app is still the app, it will
               simply obey the silent switch as a web page would.                */
        }
    }

    /*  A call, an alarm, or another app taking the session stops us, and iOS
        resumes nothing on its own. Without this the world goes quiet after a
        phone call and never comes back.                                        */
    private func observeAudioInterruptions() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(audioSessionInterrupted(_:)),
            name: AVAudioSession.interruptionNotification,
            object: AVAudioSession.sharedInstance()
        )
    }

    @objc private func audioSessionInterrupted(_ notification: Notification) {
        guard
            let info = notification.userInfo,
            let rawType = info[AVAudioSessionInterruptionTypeKey] as? UInt,
            let type = AVAudioSession.InterruptionType(rawValue: rawType)
        else { return }

        switch type {
        case .began:
            /* The system has already silenced us; there is nothing to do but
               wait to be told it is over.                                       */
            break

        case .ended:
            /*  `.shouldResume` is the system's permission to speak again.
                Reactivating without it is how an app talks over a call that is
                still in progress.                                               */
            guard
                let rawOptions = info[AVAudioSessionInterruptionOptionKey] as? UInt,
                AVAudioSession.InterruptionOptions(rawValue: rawOptions).contains(.shouldResume)
            else { return }
            try? AVAudioSession.sharedInstance().setActive(true)

        @unknown default:
            break
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
