import {
    Platform,
    Alert,
    Linking
} from 'react-native';
import _updateConfig from '../../../update.json';
import {
    isFirstTime, // 是否热更后第一次打开app
    isRolledBack, // 是否刚执行了回滚操作
    markSuccess, // 标志此次热更完成 不执行反触发机制
    packageVersion, // release版本号
    currentVersion, // 热更版本号 hash码
    checkUpdate,
    downloadUpdate,
    switchVersion,
    switchVersionLater,
} from 'react-native-update';

const {appKey} = _updateConfig[Platform.OS];

export const Update = {
    // release版本
    PACKAGE_VERSION: packageVersion,
    // 热更版本 hash码
    UPDATE_VERSION: currentVersion,
    /**
     * 检查并更新
     */
    async checkAndUpdate(options) {
        try {
            const info = await checkUpdate(appKey);
            // expired为true时有新的版本
            if(info.expired) {
                console.log('有新版本');
                Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
                    {text: '确定', onPress: ()=>{info.downloadUrl && Linking.openURL(info.downloadUrl)}},
                ]);
            }
            // upToDate为true时为最新版本
            else if(info.upToDate) {
                console.log('已新版本');
            }
            // 有的新热更包可下载
            else {
                console.log('有新热更版本', info);
                const hash = await downloadUpdate(info);
                Alert.alert('提示', '下载完毕,是否重启应用?', [
                    {text: '是', onPress: ()=>{switchVersion(hash);}},
                    {text: '否',},
                    {text: '下次启动时', onPress: ()=>{switchVersionLater(hash);}},
                ]);
            }
        }
        catch (error) {
            if(__DEV__) {
                console.log('update error', error.message);
            }
            throw error;
        }
    },
    /**
     * 检查更新状态
     * 更新成功返回true 反之返回false
     */
    async checkUpdate() {
        // 版本已回滚
        if(isRolledBack) {
            return false;
        }
        else if(isFirstTime) {
            markSuccess();
        }
    },
};
